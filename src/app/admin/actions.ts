"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  deliveryZones,
  galleryItems,
  media,
  orderStatusHistory,
  orders,
  products,
  reviews,
  settings,
  type OpeningHours,
} from "@/db/schema";
import {
  endAdminSession,
  hashPassword,
  loginRateLimited,
  requireAdmin,
  startAdminSession,
  verifyPassword,
} from "@/lib/auth";
import { DAYS } from "@/lib/hours";
import { isOrderStatus, ORDER_STATUS } from "@/lib/orders";
import { getProductById, getSettings } from "@/lib/queries";
import {
  MAX_UPLOAD_BYTES,
  parseExtrasText,
  parseRandsToCents,
  parseVariationsText,
  slugify,
  sniffImageType,
} from "@/lib/utils";

// ---- helpers ----------------------------------------------------------
const text = (data: FormData, key: string, max = 500) =>
  String(data.get(key) ?? "")
    .trim()
    .slice(0, max);
const num = (data: FormData, key: string) => {
  const value = Number(data.get(key));
  return Number.isFinite(value) ? value : 0;
};
const bool = (data: FormData, key: string) => data.get(key) === "on" || data.get(key) === "true";
const refresh = () => revalidatePath("/", "layout");

// ======================================================================
// Authentication
// ======================================================================
export async function setupOwnerPassword(formData: FormData) {
  const current = await getSettings();
  if (current.adminPasswordHash) redirect("/admin/login?error=exists");
  const password = text(formData, "password", 200);
  const confirm = text(formData, "confirm", 200);
  if (password.length < 8) redirect("/admin/login?error=short");
  if (password !== confirm) redirect("/admin/login?error=match");

  await db
    .update(settings)
    .set({ adminPasswordHash: hashPassword(password), updatedAt: new Date() })
    .where(eq(settings.id, 1));
  await startAdminSession();
  redirect("/admin");
}

export async function loginOwner(formData: FormData) {
  if (await loginRateLimited()) redirect("/admin/login?error=ratelimit");
  const current = await getSettings();
  if (!current.adminPasswordHash) redirect("/admin/login");
  const password = text(formData, "password", 200);
  if (!verifyPassword(password, current.adminPasswordHash)) {
    redirect("/admin/login?error=invalid");
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logoutOwner() {
  await endAdminSession();
  redirect("/admin/login");
}

export async function changeOwnerPassword(formData: FormData) {
  await requireAdmin();
  const current = await getSettings();
  const existing = text(formData, "current", 200);
  const password = text(formData, "password", 200);
  const confirm = text(formData, "confirm", 200);
  if (!current.adminPasswordHash || !verifyPassword(existing, current.adminPasswordHash))
    redirect("/admin/settings?error=current#password");
  if (password.length < 8) redirect("/admin/settings?error=short#password");
  if (password !== confirm) redirect("/admin/settings?error=match#password");
  await db
    .update(settings)
    .set({ adminPasswordHash: hashPassword(password), updatedAt: new Date() })
    .where(eq(settings.id, 1));
  redirect("/admin/settings?saved=password#password");
}

// ======================================================================
// Orders — manual accept / reject / progress
// ======================================================================
export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = num(formData, "orderId");
  const next = text(formData, "status", 40);
  const note = text(formData, "note", 300);
  if (!orderId || !isOrderStatus(next)) return;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return;
  const currentStatus = isOrderStatus(order.status) ? order.status : "pending";
  if (!ORDER_STATUS[currentStatus].next.includes(next)) return; // illegal jump

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: next, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    await tx.insert(orderStatusHistory).values({
      orderId,
      fromStatus: currentStatus,
      toStatus: next,
      note: note || null,
      changedBy: "owner",
    });
  });
  refresh();
}

export async function saveOrderNotes(formData: FormData) {
  await requireAdmin();
  const orderId = num(formData, "orderId");
  if (!orderId) return;
  await db
    .update(orders)
    .set({ ownerNotes: text(formData, "ownerNotes", 500) || null, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  refresh();
}

// ======================================================================
// Products
// ======================================================================
export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const name = text(formData, "name", 120);
  const priceCents = parseRandsToCents(text(formData, "price", 20));
  if (name.length < 2 || priceCents === null || priceCents < 0) {
    redirect(`/admin/products/${id || "new"}?error=invalid`);
  }

  const categoryId = num(formData, "categoryId") || null;
  const mediaId = num(formData, "mediaId");
  const typedUrl = text(formData, "imageUrl", 300);
  const imageUrl = mediaId ? `/api/media/${mediaId}` : typedUrl || null;

  const values = {
    name,
    categoryId,
    description: text(formData, "description", 600) || null,
    priceCents,
    imageUrl,
    isAvailable: bool(formData, "isAvailable"),
    isFeatured: bool(formData, "isFeatured"),
    isPromo: bool(formData, "isPromo"),
    promoTagline: text(formData, "promoTagline", 120) || null,
    variations: parseVariationsText(text(formData, "variations", 2000)),
    extras: parseExtrasText(text(formData, "extras", 2000)),
    sortOrder: num(formData, "sortOrder"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    let slug = slugify(name) || `product-${Date.now()}`;
    const [clash] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug));
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
    await db.insert(products).values({ ...values, slug });
  }
  refresh();
  redirect("/admin/products?saved=1");
}

export async function toggleProductFlag(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const field = text(formData, "field", 20);
  const product = await getProductById(id);
  if (!product) return;
  if (field === "isAvailable")
    await db.update(products).set({ isAvailable: !product.isAvailable, updatedAt: new Date() }).where(eq(products.id, id));
  if (field === "isFeatured")
    await db.update(products).set({ isFeatured: !product.isFeatured, updatedAt: new Date() }).where(eq(products.id, id));
  refresh();
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  if (id) await db.delete(products).where(eq(products.id, id));
  refresh();
  redirect("/admin/products?deleted=1");
}

// ======================================================================
// Categories
// ======================================================================
export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const name = text(formData, "name", 80);
  if (name.length < 2) return;
  const values = {
    name,
    description: text(formData, "description", 200) || null,
    sortOrder: num(formData, "sortOrder"),
    isActive: bool(formData, "isActive"),
  };
  if (id) {
    await db.update(categories).set(values).where(eq(categories.id, id));
  } else {
    let slug = slugify(name) || `category-${Date.now()}`;
    const [clash] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug));
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
    await db.insert(categories).values({ ...values, slug });
  }
  refresh();
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  if (id) await db.delete(categories).where(eq(categories.id, id)); // products keep existing (category becomes null)
  refresh();
}

// ======================================================================
// Settings: business info, opening hours, delivery zones
// ======================================================================
export async function saveBusinessSettings(formData: FormData) {
  await requireAdmin();
  await db
    .update(settings)
    .set({
      businessName: text(formData, "businessName", 80) || "Danko Mkholwa",
      slogan: text(formData, "slogan", 120) || "Flavour that feels like home.",
      callToAction: text(formData, "callToAction", 60) || "Order, Chommie!",
      whatsappNumber: text(formData, "whatsappNumber", 20) || "076 712 4232",
      instagramHandle: text(formData, "instagramHandle", 60).replace(/^@/, "") || "danko_mkholwa",
      address: text(formData, "address", 240),
      aboutText: text(formData, "aboutText", 2000),
      deliveryAreaText: text(formData, "deliveryAreaText", 200),
      deliveryNote: text(formData, "deliveryNote", 300) || null,
      acceptingOrders: bool(formData, "acceptingOrders"),
      deliveryEnabled: bool(formData, "deliveryEnabled"),
      collectionEnabled: bool(formData, "collectionEnabled"),
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 1));
  refresh();
  redirect("/admin/settings?saved=business");
}

export async function saveOpeningHours(formData: FormData) {
  await requireAdmin();
  const hours = {} as OpeningHours;
  for (const day of DAYS) {
    const open = text(formData, `${day.key}-open`, 5) || "08:00";
    const close = text(formData, `${day.key}-close`, 5) || "20:00";
    hours[day.key] = { open, close, closed: bool(formData, `${day.key}-closed`) };
  }
  await db.update(settings).set({ openingHours: hours, updatedAt: new Date() }).where(eq(settings.id, 1));
  refresh();
  redirect("/admin/settings?saved=hours#hours");
}

export async function saveDeliveryZone(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const name = text(formData, "name", 80);
  const feeCents = parseRandsToCents(text(formData, "fee", 20));
  if (name.length < 2 || feeCents === null || feeCents < 0) redirect("/admin/settings?error=zone#delivery");
  const values = {
    name,
    feeCents,
    description: text(formData, "description", 160) || null,
    isActive: bool(formData, "isActive"),
    sortOrder: num(formData, "sortOrder"),
  };
  if (id) await db.update(deliveryZones).set(values).where(eq(deliveryZones.id, id));
  else await db.insert(deliveryZones).values(values);
  refresh();
  redirect("/admin/settings?saved=zone#delivery");
}

export async function deleteDeliveryZone(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  if (id) await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
  refresh();
  redirect("/admin/settings#delivery");
}

// ======================================================================
// Media / upload centre
// ======================================================================
async function storeUpload(file: File, kind: string): Promise<number | string> {
  if (file.size === 0) return "empty";
  if (file.size > MAX_UPLOAD_BYTES) return "size";
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime) return "type";
  const [saved] = await db
    .insert(media)
    .values({
      filename: file.name.slice(0, 120) || "upload",
      mimeType: mime,
      sizeBytes: file.size,
      kind,
      dataBase64: Buffer.from(bytes).toString("base64"),
    })
    .returning({ id: media.id });
  return saved.id;
}

export async function uploadMedia(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  const kind = text(formData, "kind", 20) || "other";
  if (!(file instanceof File)) redirect("/admin/media?error=empty");
  const result = await storeUpload(file, kind);
  if (typeof result === "string") redirect(`/admin/media?error=${result}`);

  const url = `/api/media/${result}`;
  if (kind === "logo") {
    await db.update(settings).set({ logoUrl: url, updatedAt: new Date() }).where(eq(settings.id, 1));
  }
  if (kind === "hero") {
    await db.update(settings).set({ heroImageUrl: url, updatedAt: new Date() }).where(eq(settings.id, 1));
  }
  if (kind === "gallery") {
    await db.insert(galleryItems).values({
      imageUrl: url,
      caption: text(formData, "caption", 140) || null,
      submittedBy: null,
      source: "owner",
      status: "approved",
    });
  }
  refresh();
  redirect("/admin/media?saved=1");
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  if (!id) return;
  const url = `/api/media/${id}`;
  const current = await getSettings();
  if (current.logoUrl === url) await db.update(settings).set({ logoUrl: null }).where(eq(settings.id, 1));
  if (current.heroImageUrl === url) await db.update(settings).set({ heroImageUrl: null }).where(eq(settings.id, 1));
  await db.update(products).set({ imageUrl: null }).where(eq(products.imageUrl, url));
  await db.delete(galleryItems).where(eq(galleryItems.imageUrl, url));
  await db.delete(media).where(eq(media.id, id));
  refresh();
}

export async function setBrandImage(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const target = text(formData, "target", 10); // 'logo' | 'hero' | 'clear-logo' | 'clear-hero'
  const url = id ? `/api/media/${id}` : null;
  if (target === "logo") await db.update(settings).set({ logoUrl: url }).where(eq(settings.id, 1));
  if (target === "hero") await db.update(settings).set({ heroImageUrl: url }).where(eq(settings.id, 1));
  refresh();
}

// ======================================================================
// Gallery & reviews moderation
// ======================================================================
export async function moderateGallery(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const status = text(formData, "status", 10);
  if (!id) return;
  if (status === "delete") await db.delete(galleryItems).where(eq(galleryItems.id, id));
  else if (["approved", "rejected", "pending"].includes(status))
    await db.update(galleryItems).set({ status }).where(eq(galleryItems.id, id));
  refresh();
}

export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const status = text(formData, "status", 10);
  if (!id) return;
  if (status === "delete") await db.delete(reviews).where(eq(reviews.id, id));
  else if (["approved", "rejected", "pending"].includes(status))
    await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  refresh();
}

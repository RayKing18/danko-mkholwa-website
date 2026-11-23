import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  deliveryZones,
  galleryItems,
  media,
  orderItems,
  orderStatusHistory,
  orders,
  products,
  reviews,
  settings,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { ACTIVE_STATUSES } from "./orders";

export type Settings = typeof settings.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;

// ---- Settings -------------------------------------------------------
export async function getSettings(): Promise<Settings> {
  await ensureSeeded();
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  if (!row) throw new Error("Restaurant settings are missing");
  return row;
}

// ---- Menu -----------------------------------------------------------
export async function getCategories(includeInactive = false) {
  await ensureSeeded();
  return db
    .select()
    .from(categories)
    .where(includeInactive ? undefined : eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getMenu() {
  const cats = await getCategories();
  const items = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.name));
  return cats.map((category) => ({
    category,
    products: items.filter((p) => p.categoryId === category.id),
  }));
}

export async function getAllProducts() {
  await ensureSeeded();
  return db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.name));
}

export async function getFeaturedProducts(limit = 6) {
  await ensureSeeded();
  return db
    .select()
    .from(products)
    .where(and(eq(products.isFeatured, true), eq(products.isAvailable, true)))
    .orderBy(asc(products.sortOrder))
    .limit(limit);
}

export async function getPromoProduct() {
  await ensureSeeded();
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.isPromo, true))
    .orderBy(asc(products.sortOrder))
    .limit(1);
  return row ?? null;
}

export async function getProductBySlug(slug: string) {
  await ensureSeeded();
  const [row] = await db.select().from(products).where(eq(products.slug, slug));
  return row ?? null;
}

export async function getProductById(id: number) {
  const [row] = await db.select().from(products).where(eq(products.id, id));
  return row ?? null;
}

export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}

// ---- Delivery zones -------------------------------------------------
export async function getDeliveryZones(activeOnly = true) {
  await ensureSeeded();
  return db
    .select()
    .from(deliveryZones)
    .where(activeOnly ? eq(deliveryZones.isActive, true) : undefined)
    .orderBy(asc(deliveryZones.sortOrder), asc(deliveryZones.name));
}

// ---- Orders ---------------------------------------------------------
export async function getOrderByReference(reference: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.reference, reference.toUpperCase()));
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id));
  return { order, items };
}

export async function getOrderByClientKey(clientKey: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.clientKey, clientKey));
  return order ?? null;
}

export type OrderFilter = "pending" | "active" | "completed" | "all";

export async function listOrders(filter: OrderFilter, limit = 100) {
  const where =
    filter === "pending"
      ? eq(orders.status, "pending")
      : filter === "active"
        ? inArray(orders.status, ACTIVE_STATUSES)
        : filter === "completed"
          ? inArray(orders.status, ["completed", "rejected", "cancelled"])
          : undefined;

  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  const ids = rows.map((o) => o.id);
  const items =
    ids.length === 0
      ? []
      : await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, ids))
          .orderBy(asc(orderItems.id));

  return rows.map((order) => ({
    order,
    items: items.filter((i) => i.orderId === order.id),
  }));
}

export async function getOrderHistory(orderId: number) {
  return db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(asc(orderStatusHistory.createdAt));
}

export async function getDashboardStats() {
  const startOfToday = new Date();
  // Midnight in Africa/Johannesburg (UTC+2, no daylight saving)
  const zaOffsetMs = 2 * 60 * 60 * 1000;
  const zaNow = new Date(startOfToday.getTime() + zaOffsetMs);
  zaNow.setUTCHours(0, 0, 0, 0);
  const todayStart = new Date(zaNow.getTime() - zaOffsetMs);

  const [pending] = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const [active] = await db
    .select({ value: count() })
    .from(orders)
    .where(inArray(orders.status, ACTIVE_STATUSES));
  const [today] = await db
    .select({ value: count() })
    .from(orders)
    .where(gte(orders.createdAt, todayStart));
  const [revenue] = await db
    .select({
      value: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
    })
    .from(orders)
    .where(
      and(eq(orders.status, "completed"), gte(orders.createdAt, todayStart)),
    );

  return {
    pending: pending?.value ?? 0,
    active: active?.value ?? 0,
    today: today?.value ?? 0,
    revenueTodayCents: Number(revenue?.value ?? 0),
  };
}

// ---- Media ----------------------------------------------------------
export async function listMedia() {
  return db
    .select({
      id: media.id,
      filename: media.filename,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      kind: media.kind,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(desc(media.createdAt));
}

export async function getMediaById(id: number) {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  return row ?? null;
}

// ---- Gallery & reviews ---------------------------------------------
export async function getApprovedGallery(limit?: number) {
  await ensureSeeded();
  const query = db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.status, "approved"))
    .orderBy(desc(galleryItems.createdAt));
  return limit ? query.limit(limit) : query;
}

export async function listGalleryAll() {
  return db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
}

export async function getApprovedReviews() {
  await ensureSeeded();
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt));
}

export async function listReviewsAll() {
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function countPendingModeration() {
  const [g] = await db
    .select({ value: count() })
    .from(galleryItems)
    .where(eq(galleryItems.status, "pending"));
  const [r] = await db
    .select({ value: count() })
    .from(reviews)
    .where(eq(reviews.status, "pending"));
  return { gallery: g?.value ?? 0, reviews: r?.value ?? 0 };
}

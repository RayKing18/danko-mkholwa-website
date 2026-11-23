"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems, media, orders, reviews } from "@/db/schema";
import { MAX_UPLOAD_BYTES, sniffImageType } from "@/lib/utils";

const text = (data: FormData, key: string, max: number) =>
  String(data.get(key) ?? "")
    .trim()
    .slice(0, max);

/** Customer shares a photo → stored as PENDING until the owner approves it. */
export async function submitGalleryPhoto(formData: FormData) {
  const name = text(formData, "name", 60);
  const caption = text(formData, "caption", 140);
  const file = formData.get("photo");

  if (name.length < 2) redirect("/gallery?error=name");
  if (!(file instanceof File) || file.size === 0) redirect("/gallery?error=photo");
  if (file.size > MAX_UPLOAD_BYTES) redirect("/gallery?error=size");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime) redirect("/gallery?error=type");

  const [saved] = await db
    .insert(media)
    .values({
      filename: file.name.slice(0, 120) || "customer-photo",
      mimeType: mime,
      sizeBytes: file.size,
      kind: "gallery",
      dataBase64: Buffer.from(bytes).toString("base64"),
    })
    .returning({ id: media.id });

  await db.insert(galleryItems).values({
    imageUrl: `/api/media/${saved.id}`,
    caption: caption || null,
    submittedBy: name,
    source: "customer",
    status: "pending",
  });

  redirect("/gallery?submitted=1");
}

/** Customer review → PENDING until approved. Verified only if the order reference is a completed order. */
export async function submitReview(formData: FormData) {
  const name = text(formData, "name", 60);
  const comment = text(formData, "comment", 600);
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating")) || 0));
  const reference = text(formData, "reference", 20).toUpperCase();

  if (name.length < 2 || comment.length < 5 || !rating) redirect("/reviews?error=invalid");

  let verified = false;
  if (reference) {
    const [order] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.reference, reference), eq(orders.status, "completed")));
    verified = Boolean(order);
  }

  await db.insert(reviews).values({
    customerName: name,
    rating,
    comment,
    orderReference: reference || null,
    isVerified: verified,
    status: "pending",
  });

  redirect("/reviews?submitted=1");
}

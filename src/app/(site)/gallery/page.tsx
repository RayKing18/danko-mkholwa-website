import type { Metadata } from "next";
import { submitGalleryPhoto } from "@/app/actions";
import { BrandImage } from "@/components/BrandImage";
import { Button, Container, GeoBorder } from "@/components/ui";
import { getApprovedGallery } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

const ERRORS: Record<string, string> = {
  name: "Please tell us your name.",
  photo: "Please choose a photo to upload.",
  size: "That photo is too large — please keep it under 5 MB.",
  type: "Only JPG, PNG or WEBP photos are accepted.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const [{ submitted, error }, items] = await Promise.all([searchParams, getApprovedGallery()]);

  return (
    <Container className="py-12">
      <p className="font-script text-2xl text-gold">Eat good. Feel good.</p>
      <h1 className="font-display text-6xl leading-none text-white">Gallery</h1>
      <GeoBorder className="mt-4" />

      {items.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="font-display text-3xl text-white">No photos published yet</p>
          <p className="mt-2 text-white/60">
            The owner publishes photos from the dashboard, and approved customer photos appear here too.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <figure key={item.id} className="card overflow-hidden">
              <BrandImage src={item.imageUrl} alt={item.caption ?? "Danko Mkholwa"} className="aspect-square w-full" />
              {(item.caption || item.submittedBy) && (
                <figcaption className="p-3 text-xs text-white/70">
                  {item.caption}
                  {item.submittedBy && item.source === "customer" && (
                    <span className="block text-white/40">📸 {item.submittedBy}</span>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <section className="card mt-14 max-w-2xl p-6 sm:p-8">
        <h2 className="font-display text-4xl text-white">Share your Danko moment</h2>
        <p className="mt-2 text-sm text-white/60">
          Upload a photo of your meal. Every photo is reviewed by the owner before it is published.
        </p>
        {submitted && (
          <p className="mt-4 rounded-xl border border-brand-teal/40 bg-brand-teal/10 p-3 text-sm">
            Danko! Your photo has been sent for approval.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-sm">
            {ERRORS[error] ?? "Something went wrong. Please try again."}
          </p>
        )}
        <form action={submitGalleryPhoto} className="mt-6 space-y-4" encType="multipart/form-data">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="g-name">Your name</label>
              <input id="g-name" name="name" className="input" required maxLength={60} />
            </div>
            <div>
              <label className="label" htmlFor="g-caption">Caption (optional)</label>
              <input id="g-caption" name="caption" className="input" maxLength={140} placeholder="Double Cheeseburger Friday!" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="g-photo">Photo (JPG / PNG / WEBP, max 5 MB)</label>
            <input id="g-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="input file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-3 file:py-1 file:text-xs file:font-bold file:text-ink" />
          </div>
          <Button type="submit">Send for approval</Button>
        </form>
      </section>
    </Container>
  );
}

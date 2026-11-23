import type { Metadata } from "next";
import { submitReview } from "@/app/actions";
import { Badge, Button, Container, GeoBorder } from "@/components/ui";
import { getApprovedReviews } from "@/lib/queries";
import { formatDateTimeZA } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-white/20">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string; ref?: string }>;
}) {
  const [{ submitted, error, ref }, items] = await Promise.all([searchParams, getApprovedReviews()]);
  const average = items.length
    ? (items.reduce((sum, r) => sum + r.rating, 0) / items.length).toFixed(1)
    : null;

  return (
    <Container className="py-12">
      <p className="font-script text-2xl text-gold">What the chommies say</p>
      <h1 className="font-display text-6xl leading-none text-white">Reviews</h1>
      <GeoBorder className="mt-4" />

      {items.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="font-display text-3xl text-white">No reviews yet</p>
          <p className="mt-2 text-white/60">
            Be the first to tell Newcastle about Danko Mkholwa. Reviews are published after the owner approves them.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-white/70">
            <span className="font-display text-4xl text-gold">{average}</span> / 5 from {items.length}{" "}
            {items.length === 1 ? "review" : "reviews"}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {items.map((review) => (
              <article key={review.id} className="card p-6">
                <div className="flex items-center justify-between gap-3">
                  <Stars rating={review.rating} />
                  {review.isVerified && <Badge tone="teal">Verified purchase</Badge>}
                </div>
                <p className="mt-3 text-white/85">{review.comment}</p>
                <p className="mt-4 text-xs text-white/45">
                  — {review.customerName}, {formatDateTimeZA(review.createdAt).split(",")[0]}
                </p>
              </article>
            ))}
          </div>
        </>
      )}

      <section className="card mt-14 max-w-2xl p-6 sm:p-8">
        <h2 className="font-display text-4xl text-white">Write a review</h2>
        <p className="mt-2 text-sm text-white/60">
          Add your order reference (e.g. DM-ABC123) from a completed order to earn a “Verified purchase” badge.
        </p>
        {submitted && (
          <p className="mt-4 rounded-xl border border-brand-teal/40 bg-brand-teal/10 p-3 text-sm">
            Danko! Your review has been sent for approval.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-sm">
            Please fill in your name, a rating and a comment of at least 5 characters.
          </p>
        )}
        <form action={submitReview} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="r-name">Your name</label>
              <input id="r-name" name="name" className="input" required maxLength={60} />
            </div>
            <div>
              <label className="label" htmlFor="r-ref">Order reference (optional)</label>
              <input id="r-ref" name="reference" className="input" maxLength={20} defaultValue={ref ?? ""} placeholder="DM-XXXXXXX" />
            </div>
          </div>
          <fieldset>
            <legend className="label">Rating</legend>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-1 rounded-full border border-white/15 px-3 py-2 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/10">
                  <input type="radio" name="rating" value={value} defaultChecked={value === 5} className="accent-gold" />
                  {value} ★
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="label" htmlFor="r-comment">Your review</label>
            <textarea id="r-comment" name="comment" className="input" rows={4} required minLength={5} maxLength={600} />
          </div>
          <Button type="submit">Send for approval</Button>
        </form>
      </section>
    </Container>
  );
}

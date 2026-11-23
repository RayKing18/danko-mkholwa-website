import { moderateGallery, moderateReview } from "@/app/admin/actions";
import { BrandImage } from "@/components/BrandImage";
import { Badge, buttonClass } from "@/components/ui";
import { listGalleryAll, listReviewsAll } from "@/lib/queries";
import { formatDateTimeZA } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "gold" | "teal" | "red" | "muted"> = {
  pending: "gold",
  approved: "teal",
  rejected: "red",
};

function ModerationButtons({
  action,
  id,
  status,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  status: string;
}) {
  return (
    <form action={action} className="flex flex-wrap gap-1.5">
      <input type="hidden" name="id" value={id} />
      {status !== "approved" && (
        <button type="submit" name="status" value="approved" className={buttonClass("whatsapp", "sm", "!px-3 !py-1")}>Approve</button>
      )}
      {status !== "rejected" && (
        <button type="submit" name="status" value="rejected" className={buttonClass("ghost", "sm", "border border-white/15 !px-3 !py-1")}>Reject</button>
      )}
      <button type="submit" name="status" value="delete" className={buttonClass("danger", "sm", "!px-3 !py-1")}>Delete</button>
    </form>
  );
}

export default async function CommunityPage() {
  const [gallery, reviews] = await Promise.all([listGalleryAll(), listReviewsAll()]);
  const sortPendingFirst = <T extends { status: string }>(rows: T[]) =>
    [...rows].sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1));

  return (
    <>
      <p className="font-script text-xl text-gold">Community</p>
      <h1 className="font-display text-5xl leading-none text-white">Gallery & Reviews</h1>
      <p className="mt-3 text-sm text-white/60">
        Nothing submitted by customers is shown on the website until you approve it here.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-3xl text-white">Gallery photos ({gallery.length})</h2>
        {gallery.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">No gallery photos yet. Upload some in the Upload Centre (kind: Gallery).</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {sortPendingFirst(gallery).map((item) => (
              <li key={item.id} className="card overflow-hidden">
                <BrandImage src={item.imageUrl} alt={item.caption ?? "Gallery"} className="aspect-square w-full" />
                <div className="space-y-2 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={STATUS_TONE[item.status] ?? "muted"}>{item.status}</Badge>
                    <span className="text-white/40">{item.source}</span>
                  </div>
                  {item.caption && <p className="text-white/80">{item.caption}</p>}
                  {item.submittedBy && <p className="text-white/50">By {item.submittedBy}</p>}
                  <p className="text-white/40">{formatDateTimeZA(item.createdAt)}</p>
                  <ModerationButtons action={moderateGallery} id={item.id} status={item.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl text-white">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">No reviews submitted yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {sortPendingFirst(reviews).map((review) => (
              <li key={review.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gold">{"★".repeat(review.rating)}<span className="text-white/20">{"★".repeat(5 - review.rating)}</span></span>
                    <Badge tone={STATUS_TONE[review.status] ?? "muted"}>{review.status}</Badge>
                    {review.isVerified && <Badge tone="teal">Verified purchase</Badge>}
                  </div>
                  <span className="text-xs text-white/40">{formatDateTimeZA(review.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm text-white/85">{review.comment}</p>
                <p className="mt-2 text-xs text-white/50">
                  — {review.customerName}
                  {review.orderReference && ` · Ref ${review.orderReference}${review.isVerified ? "" : " (not a completed order)"}`}
                </p>
                <div className="mt-3">
                  <ModerationButtons action={moderateReview} id={review.id} status={review.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

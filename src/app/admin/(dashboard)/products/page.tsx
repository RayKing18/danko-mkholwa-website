import Link from "next/link";
import { toggleProductFlag } from "@/app/admin/actions";
import { BrandImage } from "@/components/BrandImage";
import { Badge, buttonClass } from "@/components/ui";
import { getAllProducts, getCategories } from "@/lib/queries";
import { formatZAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [{ saved, deleted }, products, categories] = await Promise.all([
    searchParams,
    getAllProducts(),
    getCategories(true),
  ]);
  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? "Uncategorised";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-script text-xl text-gold">Menu management</p>
          <h1 className="font-display text-5xl leading-none text-white">Products</h1>
        </div>
        <Link href="/admin/products/new" className={buttonClass("primary", "md")}>+ Add product</Link>
      </div>

      {(saved || deleted) && (
        <p className="mt-4 rounded-xl border border-brand-teal/40 bg-brand-teal/10 p-3 text-sm">
          {saved ? "Product saved." : "Product deleted."}
        </p>
      )}

      <p className="mt-4 text-sm text-white/60">
        Tap <strong>Sold out</strong> to hide a product from ordering without deleting it. Featured products appear on the homepage.
      </p>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <li key={product.id} className={`card flex gap-4 p-4 ${product.isAvailable ? "" : "opacity-70"}`}>
            <BrandImage src={product.imageUrl} alt={product.name} label={product.name} className="h-28 w-28 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl leading-tight text-white">{product.name}</p>
                  <p className="text-xs text-white/50">{categoryName(product.categoryId)} · /menu/{product.slug}</p>
                </div>
                <span className="font-display text-3xl text-gold">{formatZAR(product.priceCents)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {!product.isAvailable && <Badge tone="red">Sold out</Badge>}
                {product.isFeatured && <Badge tone="gold">Featured</Badge>}
                {product.isPromo && <Badge tone="teal">Promo</Badge>}
                {product.variations.length > 0 && <Badge tone="muted">{product.variations.length} variation group(s)</Badge>}
                {product.extras.length > 0 && <Badge tone="muted">{product.extras.length} extra(s)</Badge>}
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                <Link href={`/admin/products/${product.id}`} className={buttonClass("secondary", "sm")}>Edit</Link>
                <form action={toggleProductFlag}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="field" value="isAvailable" />
                  <button type="submit" className={buttonClass(product.isAvailable ? "danger" : "whatsapp", "sm")}>
                    {product.isAvailable ? "Mark sold out" : "Mark available"}
                  </button>
                </form>
                <form action={toggleProductFlag}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="field" value="isFeatured" />
                  <button type="submit" className={buttonClass("ghost", "sm", "border border-white/15")}>
                    {product.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

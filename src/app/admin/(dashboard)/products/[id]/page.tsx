import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { BrandImage } from "@/components/BrandImage";
import { Button, buttonClass } from "@/components/ui";
import { getCategories, getProductById, listMedia } from "@/lib/queries";
import { serialiseExtras, serialiseVariations } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const product = isNew ? null : await getProductById(Number(id));
  if (!isNew && !product) notFound();

  const [categories, mediaRows] = await Promise.all([getCategories(true), listMedia()]);
  const currentMediaId = product?.imageUrl?.match(/^\/api\/media\/(\d+)$/)?.[1] ?? "";

  return (
    <>
      <Link href="/admin/products" className="text-sm text-white/60 hover:text-white">← Back to products</Link>
      <h1 className="mt-2 font-display text-5xl leading-none text-white">
        {isNew ? "Add product" : `Edit: ${product?.name}`}
      </h1>

      {error && (
        <p className="mt-4 rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-sm">
          Please enter a product name and a valid price.
        </p>
      )}

      <form action={saveProduct} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {product && <input type="hidden" name="id" value={product.id} />}

        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <div>
                <label className="label" htmlFor="name">Product name</label>
                <input id="name" name="name" className="input" required maxLength={120} defaultValue={product?.name ?? ""} placeholder="e.g. Loaded Fries" />
              </div>
              <div>
                <label className="label" htmlFor="price">Price (Rands)</label>
                <input id="price" name="price" className="input" required inputMode="decimal" defaultValue={product ? (product.priceCents / 100).toString() : ""} placeholder="60" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="categoryId">Category</label>
                <select id="categoryId" name="categoryId" className="input" defaultValue={product?.categoryId ?? ""}>
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="sortOrder">Sort order (lower shows first)</label>
                <input id="sortOrder" name="sortOrder" type="number" className="input" defaultValue={product?.sortOrder ?? 0} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="description">Description</label>
              <textarea id="description" name="description" className="input" rows={3} maxLength={600} defaultValue={product?.description ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="promoTagline">Promo tagline (optional)</label>
              <input id="promoTagline" name="promoTagline" className="input" maxLength={120} defaultValue={product?.promoTagline ?? ""} placeholder="Big Flavour. Bigger Satisfaction." />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { name: "isAvailable", label: "Available to order", checked: product?.isAvailable ?? true },
                { name: "isFeatured", label: "Featured on homepage", checked: product?.isFeatured ?? false },
                { name: "isPromo", label: "Main promotion (hero)", checked: product?.isPromo ?? false },
              ].map((flag) => (
                <label key={flag.name} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm">
                  <input type="checkbox" name={flag.name} defaultChecked={flag.checked} className="h-4 w-4 accent-gold" />
                  {flag.label}
                </label>
              ))}
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="font-display text-2xl text-white">Variations & extras (optional)</h2>
            <div>
              <label className="label" htmlFor="variations">Variations — one group per line</label>
              <textarea id="variations" name="variations" className="input font-mono text-sm" rows={3} defaultValue={product ? serialiseVariations(product.variations) : ""} placeholder={"Size: Regular = 0, Large = 15\nSauce: Danko sauce = 0, Peri-peri = 0"} />
              <p className="mt-1 text-xs text-white/50">Format: <code>Group: Option = extra Rands, Option = extra Rands</code>. Use 0 for no extra charge.</p>
            </div>
            <div>
              <label className="label" htmlFor="extras">Extras — one per line</label>
              <textarea id="extras" name="extras" className="input font-mono text-sm" rows={3} defaultValue={product ? serialiseExtras(product.extras) : ""} placeholder={"Extra cheese = 10\nExtra patty = 25"} />
              <p className="mt-1 text-xs text-white/50">Format: <code>Extra name = price in Rands</code></p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card space-y-4 p-6">
            <h2 className="font-display text-2xl text-white">Photo</h2>
            <BrandImage src={product?.imageUrl} alt={product?.name ?? "New product"} label={product?.name ?? "Preview"} className="aspect-square w-full rounded-xl" />
            <div>
              <label className="label" htmlFor="mediaId">Choose from Upload Centre</label>
              <select id="mediaId" name="mediaId" className="input" defaultValue={currentMediaId}>
                <option value="">— Keep / use URL below —</option>
                {mediaRows.map((m) => (
                  <option key={m.id} value={m.id}>#{m.id} · {m.filename} ({m.kind})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="imageUrl">…or image path / URL</label>
              <input id="imageUrl" name="imageUrl" className="input" maxLength={300} defaultValue={currentMediaId ? "" : (product?.imageUrl ?? "")} placeholder="/assets/products/loaded-fries.jpg" />
            </div>
            <p className="text-xs text-white/50">
              Need a new photo? <Link href="/admin/media" className="text-gold hover:underline">Upload it first</Link>, then pick it here.
            </p>
          </section>

          <Button type="submit" size="lg" className="w-full">Save product</Button>
          <Link href="/admin/products" className={buttonClass("ghost", "md", "w-full")}>Cancel</Link>
        </aside>
      </form>

      {product && (
        <form action={deleteProduct} className="mt-10 border-t border-white/10 pt-6">
          <input type="hidden" name="id" value={product.id} />
          <p className="text-xs text-white/50">Danger zone — prefer “Mark sold out” if the product may return.</p>
          <button type="submit" className={buttonClass("danger", "sm", "mt-2")}>Delete this product permanently</button>
        </form>
      )}
    </>
  );
}

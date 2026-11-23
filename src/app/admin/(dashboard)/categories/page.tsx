import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { Button, buttonClass } from "@/components/ui";
import { getAllProducts, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(true), getAllProducts()]);
  const countFor = (id: number) => products.filter((p) => p.categoryId === id).length;

  return (
    <>
      <p className="font-script text-xl text-gold">Menu management</p>
      <h1 className="font-display text-5xl leading-none text-white">Categories</h1>
      <p className="mt-3 text-sm text-white/60">
        Inactive categories are hidden from customers. Deleting a category keeps its products (they become “Uncategorised”).
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.id} className="card p-4">
              <form action={saveCategory} className="grid gap-3 sm:grid-cols-[1fr_1fr_90px_auto] sm:items-end">
                <input type="hidden" name="id" value={category.id} />
                <div>
                  <label className="label">Name</label>
                  <input name="name" className="input" defaultValue={category.name} required maxLength={80} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input name="description" className="input" defaultValue={category.description ?? ""} maxLength={200} />
                </div>
                <div>
                  <label className="label">Order</label>
                  <input name="sortOrder" type="number" className="input" defaultValue={category.sortOrder} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="accent-gold" /> Active
                  </label>
                  <Button type="submit" size="sm" variant="secondary">Save</Button>
                </div>
              </form>
              <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                <span>/{category.slug} · {countFor(category.id)} product(s)</span>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="text-brand-red hover:underline">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-6">
          <h2 className="font-display text-2xl text-white">Add category</h2>
          <form action={saveCategory} className="mt-4 space-y-3">
            <div>
              <label className="label" htmlFor="new-name">Name</label>
              <input id="new-name" name="name" className="input" required maxLength={80} placeholder="e.g. Platters" />
            </div>
            <div>
              <label className="label" htmlFor="new-desc">Description</label>
              <input id="new-desc" name="description" className="input" maxLength={200} />
            </div>
            <div>
              <label className="label" htmlFor="new-order">Sort order</label>
              <input id="new-order" name="sortOrder" type="number" className="input" defaultValue={categories.length + 1} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked className="accent-gold" /> Active
            </label>
            <button type="submit" className={buttonClass("primary", "md", "w-full")}>Add category</button>
          </form>
        </aside>
      </div>
    </>
  );
}

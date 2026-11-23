import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandImage } from "@/components/BrandImage";
import { ProductCard } from "@/components/ProductCard";
import { ProductOptions } from "@/components/ProductOptions";
import { Badge, Container, GeoBorder, Price } from "@/components/ui";
import { getCategories, getMenu, getProductBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description ?? `${product.name} from Danko Mkholwa`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [categories, menu] = await Promise.all([getCategories(), getMenu()]);
  const category = categories.find((c) => c.id === product.categoryId);
  const related = menu
    .flatMap((section) => section.products)
    .filter((p) => p.id !== product.id && p.isAvailable)
    .sort((a, b) =>
      (a.categoryId === product.categoryId ? 0 : 1) - (b.categoryId === product.categoryId ? 0 : 1),
    )
    .slice(0, 3);

  return (
    <Container className="py-10">
      <nav className="mb-6 text-sm text-white/50" aria-label="Breadcrumb">
        <Link href="/menu" className="hover:text-sun">
          Menu
        </Link>
        {category && (
          <>
            {" / "}
            <Link href={`/menu#${category.slug}`} className="hover:text-sun">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-white/80">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <BrandImage
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full rounded-[2rem] border border-gold/30 shadow-gold"
        />

        <div>
          <div className="flex flex-wrap gap-2">
            {category && <Badge tone="muted">{category.name}</Badge>}
            {product.isPromo && <Badge tone="gold">Special</Badge>}
            {!product.isAvailable && <Badge tone="red">Sold out</Badge>}
          </div>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] text-white sm:text-6xl">
            {product.name}
          </h1>
          <GeoBorder className="mt-4" />
          <p className="mt-5">
            <Price cents={product.priceCents} className="text-5xl" />
          </p>
          {product.promoTagline && (
            <p className="mt-3 font-script text-2xl text-sun">{product.promoTagline}</p>
          )}
          {product.description && (
            <p className="mt-4 text-lg text-white/75">{product.description}</p>
          )}

          <div className="mt-8">
            <ProductOptions product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-4xl text-white">You might also like</h2>
          <GeoBorder className="mt-3" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

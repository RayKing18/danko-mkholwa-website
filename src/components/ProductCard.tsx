import Link from "next/link";
import type { Product } from "@/lib/queries";
import { BrandImage } from "./BrandImage";
import { AddToBasketButton } from "./basket/AddToBasketButton";
import { Badge, Price } from "./ui";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-gold/50">
      <Link href={`/menu/${product.slug}`} className="relative block">
        <BrandImage
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/3] w-full"
          imgClassName="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.isPromo && <Badge tone="gold">Special</Badge>}
          {!product.isAvailable && <Badge tone="red">Sold out</Badge>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight text-white">
            <Link href={`/menu/${product.slug}`} className="hover:text-sun">
              {product.name}
            </Link>
          </h3>
          <Price cents={product.priceCents} className="text-3xl leading-none" />
        </div>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-white/65">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            href={`/menu/${product.slug}`}
            className="text-xs font-semibold uppercase tracking-wider text-gold hover:text-sun"
          >
            Details
          </Link>
          <AddToBasketButton product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}

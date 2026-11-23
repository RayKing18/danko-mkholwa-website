"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/queries";
import { buttonClass } from "@/components/ui";
import { useBasket } from "./BasketProvider";

export function AddToBasketButton({
  product,
  size = "md",
  className = "",
  label = "Add to Basket",
}: {
  product: Pick<
    Product,
    "id" | "slug" | "name" | "imageUrl" | "priceCents" | "isAvailable" | "variations"
  >;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const { addItem } = useBasket();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  if (!product.isAvailable) {
    return (
      <span className={buttonClass("ghost", size, `cursor-not-allowed border border-white/10 ${className}`)}>
        Sold out
      </span>
    );
  }

  // Products with options must be configured on their own page
  if (product.variations && product.variations.length > 0) {
    return (
      <Link href={`/menu/${product.slug}`} className={buttonClass("primary", size, className)}>
        Choose options
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={buttonClass("primary", size, className)}
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: product.imageUrl,
          unitPriceCents: product.priceCents,
          quantity: 1,
          selectedOptions: [],
          extras: [],
        });
        setAdded(true);
      }}
    >
      {added ? "Added ✓" : label}
    </button>
  );
}

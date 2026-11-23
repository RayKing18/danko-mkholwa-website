"use client";

import Link from "next/link";
import { BrandImage } from "@/components/BrandImage";
import { buttonClass, Button } from "@/components/ui";
import { formatZAR } from "@/lib/utils";
import { useBasket } from "./BasketProvider";

export function BasketView() {
  const { items, hydrated, count, subtotalCents, setQuantity, removeItem, clear } = useBasket();

  if (!hydrated) {
    return <p className="text-white/50">Loading your basket…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-5xl" aria-hidden="true">🧺</p>
        <h2 className="mt-4 font-display text-4xl text-white">Your basket is empty</h2>
        <p className="mt-2 text-white/60">Go on, chommie — the Double Cheeseburger is calling.</p>
        <Link href="/menu" className={buttonClass("primary", "lg", "mt-6")}>
          Explore our menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.key} className="card flex gap-4 p-4">
            <BrandImage
              src={item.imageUrl}
              alt={item.name}
              label={item.name}
              className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28"
            />
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/menu/${item.slug}`} className="font-display text-2xl leading-tight text-white hover:text-sun">
                    {item.name}
                  </Link>
                  {item.selectedOptions.length > 0 && (
                    <p className="text-xs text-white/60">{item.selectedOptions.join(" · ")}</p>
                  )}
                  {item.extras.length > 0 && (
                    <p className="text-xs text-white/60">
                      + {item.extras.map((e) => e.label).join(", ")}
                    </p>
                  )}
                  {item.notes && <p className="text-xs italic text-white/50">“{item.notes}”</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-xs font-semibold uppercase tracking-wider text-brand-red hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center rounded-full border border-white/20">
                  <button
                    type="button"
                    className="h-9 w-9 text-lg text-gold"
                    onClick={() => setQuantity(item.key, item.quantity - 1)}
                    aria-label={`Decrease ${item.name}`}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    className="h-9 w-9 text-lg text-gold disabled:opacity-40"
                    onClick={() => setQuantity(item.key, item.quantity + 1)}
                    disabled={item.quantity >= 20}
                    aria-label={`Increase ${item.name}`}
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">
                    {item.quantity} × {formatZAR(item.unitPriceCents)}
                  </p>
                  <p className="font-display text-2xl text-gold">
                    {formatZAR(item.unitPriceCents * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-3xl text-white">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-white/70">
            <dt>Items</dt>
            <dd>{count}</dd>
          </div>
          <div className="flex justify-between text-white/70">
            <dt>Subtotal</dt>
            <dd>{formatZAR(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between text-white/70">
            <dt>Delivery</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
            <dt>Total</dt>
            <dd className="font-display text-3xl text-gold">{formatZAR(subtotalCents)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className={buttonClass("primary", "lg", "mt-6 w-full")}>
          Checkout
        </Link>
        <Link href="/menu" className={buttonClass("ghost", "md", "mt-2 w-full")}>
          Add more items
        </Link>
        <Button variant="ghost" size="sm" className="mt-4 w-full text-white/40" onClick={clear}>
          Empty basket
        </Button>
      </aside>
    </div>
  );
}

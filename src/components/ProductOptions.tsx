"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Extra } from "@/db/schema";
import type { Product } from "@/lib/queries";
import { formatZAR } from "@/lib/utils";
import { useBasket } from "./basket/BasketProvider";
import { Button, buttonClass } from "./ui";

/** Product detail configurator: variations, extras, notes, quantity. */
export function ProductOptions({ product }: { product: Product }) {
  const { addItem } = useBasket();
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.variations.map((group) => [group.name, group.options[0]?.label ?? ""]),
    ),
  );
  const [extras, setExtras] = useState<Extra[]>([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const unitPriceCents = useMemo(() => {
    let price = product.priceCents;
    for (const group of product.variations) {
      const chosen = group.options.find((o) => o.label === choices[group.name]);
      if (chosen) price += chosen.priceDeltaCents;
    }
    for (const extra of extras) price += extra.priceCents;
    return price;
  }, [product, choices, extras]);

  const toggleExtra = (extra: Extra) =>
    setExtras((current) =>
      current.some((e) => e.label === extra.label)
        ? current.filter((e) => e.label !== extra.label)
        : [...current, extra],
    );

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPriceCents,
      quantity,
      selectedOptions: product.variations.map((g) => `${g.name}: ${choices[g.name]}`),
      extras,
      notes: notes.trim() || undefined,
    });
    setAdded(true);
  };

  if (!product.isAvailable) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-3xl text-brand-red">Sold out right now</p>
        <p className="mt-2 text-sm text-white/60">Check back soon or ask us on WhatsApp.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {product.variations.map((group) => (
        <fieldset key={group.name}>
          <legend className="label">{group.name}</legend>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selected = choices[group.name] === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setChoices((c) => ({ ...c, [group.name]: option.label }))}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? "border-gold bg-gold text-ink"
                      : "border-white/20 text-white hover:border-gold"
                  }`}
                  aria-pressed={selected}
                >
                  {option.label}
                  {option.priceDeltaCents !== 0 && (
                    <span className="ml-1 opacity-70">
                      {option.priceDeltaCents > 0 ? "+" : "−"}
                      {formatZAR(Math.abs(option.priceDeltaCents))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {product.extras.length > 0 && (
        <fieldset>
          <legend className="label">Extras</legend>
          <div className="space-y-2">
            {product.extras.map((extra) => {
              const checked = extras.some((e) => e.label === extra.label);
              return (
                <label
                  key={extra.label}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                    checked ? "border-gold bg-gold/10" : "border-white/15 hover:border-gold/60"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExtra(extra)}
                      className="h-4 w-4 accent-gold"
                    />
                    {extra.label}
                  </span>
                  <span className="font-semibold text-gold">+{formatZAR(extra.priceCents)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <label className="label" htmlFor="notes">
          Special instructions (optional)
        </label>
        <textarea
          id="notes"
          className="input"
          rows={2}
          maxLength={200}
          placeholder="e.g. no onions, extra sauce"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-white/20">
          <button
            type="button"
            className="h-11 w-11 text-xl text-gold disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="h-11 w-11 text-xl text-gold disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            disabled={quantity >= 20}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button size="lg" onClick={handleAdd} className="flex-1 sm:flex-none">
          {added ? "Added to basket ✓" : `Add ${quantity} · ${formatZAR(unitPriceCents * quantity)}`}
        </Button>
      </div>

      {added && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-teal/40 bg-brand-teal/10 px-4 py-3 text-sm">
          <span>Added to your basket, chommie!</span>
          <Link href="/basket" className={buttonClass("secondary", "sm")}>
            View basket
          </Link>
          <Link href="/checkout" className={buttonClass("primary", "sm")}>
            Checkout
          </Link>
        </div>
      )}
    </div>
  );
}

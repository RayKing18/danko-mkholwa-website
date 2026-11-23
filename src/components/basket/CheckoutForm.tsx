"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DeliveryZone } from "@/lib/queries";
import { buildOrderMessage, whatsappLink } from "@/lib/orders";
import { formatZAR } from "@/lib/utils";
import { Button, buttonClass, WhatsAppIcon } from "@/components/ui";
import { useBasket } from "./BasketProvider";

type Props = {
  businessName: string;
  whatsappNumber: string;
  acceptingOrders: boolean;
  deliveryEnabled: boolean;
  collectionEnabled: boolean;
  deliveryNote: string | null;
  zones: DeliveryZone[];
};

function newClientKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutForm(props: Props) {
  const router = useRouter();
  const { items, hydrated, subtotalCents, clear } = useBasket();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfilment, setFulfilment] = useState<"collection" | "delivery">(
    props.collectionEnabled ? "collection" : "delivery",
  );
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState<number | "">("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientKey, setClientKey] = useState("");

  // One key per checkout attempt — the server ignores repeats of the same key
  useEffect(() => setClientKey(newClientKey()), []);

  const zone = useMemo(
    () => props.zones.find((z) => z.id === zoneId) ?? null,
    [props.zones, zoneId],
  );
  const deliveryFeeCents = fulfilment === "delivery" && zone ? zone.feeCents : 0;
  const feeUnknown = fulfilment === "delivery" && props.zones.length === 0;
  const totalCents = subtotalCents + deliveryFeeCents;

  const whatsappFallback = () =>
    whatsappLink(
      props.whatsappNumber,
      buildOrderMessage({
        businessName: props.businessName,
        customerName: name || "(name)",
        customerPhone: phone || "(phone)",
        fulfilment,
        deliveryAddress: address,
        deliveryZoneName: zone?.name,
        deliveryFeeCents,
        deliveryFeeConfirmed: !feeUnknown,
        subtotalCents,
        totalCents,
        specialInstructions: instructions,
        items: items.map((i) => ({
          productName: i.name,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          lineTotalCents: i.unitPriceCents * i.quantity,
          selectedOptions: i.selectedOptions,
          extras: i.extras,
          notes: i.notes,
        })),
      }),
    );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey,
          customerName: name,
          phone,
          fulfilment,
          address,
          deliveryZoneId: zoneId === "" ? null : zoneId,
          instructions,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            selectedOptions: i.selectedOptions,
            extras: i.extras.map((e) => e.label),
            notes: i.notes,
          })),
        }),
      });
      const data = (await response.json()) as { reference?: string; error?: string };
      if (!response.ok || !data.reference) {
        setError(data.error ?? "Something went wrong. Please try again or order on WhatsApp.");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/order/${data.reference}`);
    } catch {
      setError("We couldn't reach the server. You can still send your order on WhatsApp below.");
      setSubmitting(false);
    }
  };

  if (!hydrated) return <p className="text-white/50">Loading…</p>;

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <h2 className="font-display text-4xl text-white">Nothing to check out yet</h2>
        <p className="mt-2 text-white/60">Add something delicious first, chommie.</p>
        <Link href="/menu" className={buttonClass("primary", "lg", "mt-6")}>
          Explore our menu
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]" noValidate>
      <div className="space-y-8">
        {!props.acceptingOrders && (
          <div className="rounded-2xl border border-brand-red/40 bg-brand-red/10 p-4 text-sm">
            Online ordering is paused right now. You can still send your order on WhatsApp.
          </div>
        )}

        <section className="card p-6">
          <h2 className="font-display text-3xl text-white">Your details</h2>
          <p className="mt-1 text-xs text-white/50">
            No account needed. We only use these details to prepare and confirm your order (POPIA).
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" placeholder="Your name" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Cellphone (WhatsApp)</label>
              <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" autoComplete="tel" placeholder="076 123 4567" />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-3xl text-white">Collection or delivery?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {props.collectionEnabled && (
              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${fulfilment === "collection" ? "border-gold bg-gold/10" : "border-white/15 hover:border-gold/60"}`}>
                <input type="radio" name="fulfilment" className="mt-1 accent-gold" checked={fulfilment === "collection"} onChange={() => setFulfilment("collection")} />
                <span>
                  <span className="block font-semibold">Collection</span>
                  <span className="text-xs text-white/60">Pick up from Section 4, Newcastle. No delivery fee.</span>
                </span>
              </label>
            )}
            {props.deliveryEnabled && (
              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${fulfilment === "delivery" ? "border-gold bg-gold/10" : "border-white/15 hover:border-gold/60"}`}>
                <input type="radio" name="fulfilment" className="mt-1 accent-gold" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} />
                <span>
                  <span className="block font-semibold">Delivery</span>
                  <span className="text-xs text-white/60">Newcastle and surrounding areas.</span>
                </span>
              </label>
            )}
          </div>

          {fulfilment === "delivery" && (
            <div className="mt-5 space-y-4">
              {props.zones.length > 0 && (
                <div>
                  <label className="label" htmlFor="zone">Delivery area</label>
                  <select id="zone" className="input" value={zoneId} onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : "")} required>
                    <option value="">Choose your area…</option>
                    {props.zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {formatZAR(z.feeCents)}
                      </option>
                    ))}
                  </select>
                  {zone?.description && <p className="mt-1 text-xs text-white/50">{zone.description}</p>}
                </div>
              )}
              <div>
                <label className="label" htmlFor="address">Delivery address</label>
                <textarea id="address" className="input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required maxLength={240} placeholder="Street, house number, section / area, landmarks" />
              </div>
              {props.deliveryNote && <p className="text-xs text-white/55">{props.deliveryNote}</p>}
              {feeUnknown && (
                <p className="rounded-xl border border-sun/40 bg-sun/10 p-3 text-xs text-sun">
                  Delivery fee is confirmed with you on WhatsApp before we prepare your food.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-display text-3xl text-white">Special instructions</h2>
          <textarea className="input mt-4" rows={3} maxLength={400} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Allergies, sauce preferences, gate code, call on arrival…" />
        </section>
      </div>

      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-3xl text-white">Order summary</h2>
        <ul className="mt-4 divide-y divide-white/10 text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3 py-2">
              <span className="text-white/80">
                {item.quantity} × {item.name}
                {item.selectedOptions.length > 0 && (
                  <span className="block text-xs text-white/50">{item.selectedOptions.join(", ")}</span>
                )}
                {item.extras.length > 0 && (
                  <span className="block text-xs text-white/50">+ {item.extras.map((e) => e.label).join(", ")}</span>
                )}
              </span>
              <span className="shrink-0 font-semibold">{formatZAR(item.unitPriceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-white/70"><dt>Subtotal</dt><dd>{formatZAR(subtotalCents)}</dd></div>
          <div className="flex justify-between text-white/70">
            <dt>Delivery</dt>
            <dd>{fulfilment === "collection" ? "R0" : feeUnknown ? "To be confirmed" : zone ? formatZAR(deliveryFeeCents) : "Choose area"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-lg font-bold">
            <dt>Total</dt>
            <dd className="font-display text-3xl text-gold">
              {formatZAR(totalCents)}{feeUnknown ? " + delivery" : ""}
            </dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-sm text-white">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting || !props.acceptingOrders}>
          {submitting ? "Placing order…" : "Place order"}
        </Button>
        <a href={whatsappFallback()} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "md", "mt-3 w-full")}>
          <WhatsAppIcon className="h-4 w-4" /> Send order on WhatsApp instead
        </a>
        <p className="mt-4 text-center text-xs text-white/45">
          Your order is only confirmed once Danko Mkholwa confirms it with you. Payment is arranged on confirmation.
        </p>
      </aside>
    </form>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, GeoBorder, LinkButton, WhatsAppIcon } from "@/components/ui";
import {
  buildOrderMessage,
  isOrderStatus,
  ORDER_STATUS,
  whatsappLink,
} from "@/lib/orders";
import { getOrderByReference, getSettings } from "@/lib/queries";
import { formatDateTimeZA, formatZAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ reference: string }> };

export const metadata: Metadata = { title: "Your order" };

export default async function OrderPage({ params }: Props) {
  const { reference } = await params;
  const [result, settings] = await Promise.all([
    getOrderByReference(reference),
    getSettings(),
  ]);
  if (!result) notFound();
  const { order, items } = result;

  const status = isOrderStatus(order.status) ? ORDER_STATUS[order.status] : ORDER_STATUS.pending;
  const message = buildOrderMessage({
    businessName: settings.businessName,
    reference: order.reference,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    fulfilment: order.fulfilment,
    deliveryAddress: order.deliveryAddress,
    deliveryZoneName: order.deliveryZoneName,
    deliveryFeeCents: order.deliveryFeeCents,
    deliveryFeeConfirmed: order.deliveryFeeConfirmed,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    specialInstructions: order.specialInstructions,
    items,
  });
  const wa = whatsappLink(settings.whatsappNumber, message);

  return (
    <Container className="max-w-3xl py-12">
      <p className="font-script text-2xl text-gold">Danko — thank you, chommie!</p>
      <h1 className="font-display text-6xl leading-none text-white">Order {order.reference}</h1>
      <GeoBorder className="mt-4" />

      <div className={`mt-8 rounded-2xl border p-5 ${status.tone}`}>
        <p className="text-xs font-bold uppercase tracking-wider">Status</p>
        <p className="mt-1 font-display text-3xl">{status.label}</p>
        <p className="mt-2 text-sm text-white/85">{status.customerText}</p>
      </div>

      {order.status === "pending" && (
        <div className="card mt-6 bg-glow p-6 text-center">
          <p className="font-display text-3xl text-white">Step 2: send it to us on WhatsApp</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
            Tap the button — your order details are already typed out. We confirm, arrange payment and get cooking.
          </p>
          <LinkButton href={wa} external variant="whatsapp" size="lg" className="mt-5 w-full sm:w-auto">
            <WhatsAppIcon /> Send order on WhatsApp
          </LinkButton>
          <p className="mt-4 text-xs text-white/45">
            Refresh this page later to see your order status change.
          </p>
        </div>
      )}

      <section className="card mt-6 p-6">
        <h2 className="font-display text-3xl text-white">Order details</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-white/50">Name</dt><dd>{order.customerName}</dd></div>
          <div><dt className="text-white/50">Phone</dt><dd>{order.customerPhone}</dd></div>
          <div><dt className="text-white/50">Type</dt><dd className="capitalize">{order.fulfilment}</dd></div>
          <div><dt className="text-white/50">Placed</dt><dd>{formatDateTimeZA(order.createdAt)}</dd></div>
          {order.deliveryAddress && (
            <div className="sm:col-span-2"><dt className="text-white/50">Address</dt><dd>{order.deliveryAddress}</dd></div>
          )}
          {order.deliveryZoneName && (
            <div><dt className="text-white/50">Area</dt><dd>{order.deliveryZoneName}</dd></div>
          )}
          {order.specialInstructions && (
            <div className="sm:col-span-2"><dt className="text-white/50">Instructions</dt><dd>{order.specialInstructions}</dd></div>
          )}
        </dl>

        <ul className="mt-6 divide-y divide-white/10 border-t border-white/10 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <span>
                {item.quantity} × {item.productName}
                <span className="block text-xs text-white/50">
                  {formatZAR(item.unitPriceCents)} each
                  {item.selectedOptions.length > 0 && ` · ${item.selectedOptions.join(", ")}`}
                  {item.extras.length > 0 && ` · + ${item.extras.map((e) => e.label).join(", ")}`}
                </span>
                {item.notes && <span className="block text-xs italic text-white/50">“{item.notes}”</span>}
              </span>
              <span className="font-semibold">{formatZAR(item.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-white/70"><dt>Subtotal</dt><dd>{formatZAR(order.subtotalCents)}</dd></div>
          {order.fulfilment === "delivery" && (
            <div className="flex justify-between text-white/70">
              <dt>Delivery</dt>
              <dd>{order.deliveryFeeConfirmed ? formatZAR(order.deliveryFeeCents) : "To be confirmed"}</dd>
            </div>
          )}
          <div className="flex justify-between pt-2 text-lg font-bold">
            <dt>Total</dt>
            <dd className="font-display text-3xl text-gold">
              {formatZAR(order.totalCents)}
              {order.fulfilment === "delivery" && !order.deliveryFeeConfirmed ? " + delivery" : ""}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/menu" className="text-sm font-semibold uppercase tracking-wider text-gold hover:text-sun">
          ← Back to menu
        </Link>
        {order.status === "completed" && (
          <Link href={`/reviews?ref=${order.reference}`} className="text-sm font-semibold uppercase tracking-wider text-gold hover:text-sun">
            Leave a review →
          </Link>
        )}
      </div>
    </Container>
  );
}

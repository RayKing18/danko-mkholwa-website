import Link from "next/link";
import { saveOrderNotes, updateOrderStatus } from "@/app/admin/actions";
import { isOrderStatus, ORDER_STATUS, whatsappLink, type OrderStatus } from "@/lib/orders";
import { getDashboardStats, listOrders, type OrderFilter } from "@/lib/queries";
import { formatDateTimeZA, formatZAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "pending", label: "Needs action" },
  { key: "active", label: "In progress" },
  { key: "completed", label: "Finished" },
  { key: "all", label: "All" },
];

const ACTION_STYLE: Partial<Record<OrderStatus, string>> = {
  accepted: "bg-brand-teal text-white hover:bg-brand-teal/80",
  rejected: "border border-brand-red text-brand-red hover:bg-brand-red hover:text-white",
  cancelled: "border border-brand-red/60 text-brand-red hover:bg-brand-red hover:text-white",
  completed: "bg-gold text-ink hover:bg-sun",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter: OrderFilter = FILTERS.some((f) => f.key === rawFilter)
    ? (rawFilter as OrderFilter)
    : "pending";
  const [stats, rows] = await Promise.all([getDashboardStats(), listOrders(filter)]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-script text-xl text-gold">Sawubona, boss</p>
          <h1 className="font-display text-5xl leading-none text-white">Orders</h1>
        </div>
        <p className="text-xs text-white/50">Times shown in Africa/Johannesburg. Refresh to see new orders.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Awaiting your confirmation", value: stats.pending, tone: "text-sun" },
          { label: "In progress", value: stats.active, tone: "text-brand-teal" },
          { label: "Orders today", value: stats.today, tone: "text-white" },
          { label: "Completed sales today", value: formatZAR(stats.revenueTodayCents), tone: "text-gold" },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">{card.label}</p>
            <p className={`mt-2 font-display text-4xl ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin?filter=${f.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              filter === f.key ? "bg-white text-ink" : "border border-white/15 text-white/70 hover:bg-white/10"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <p className="font-display text-3xl text-white">No orders here</p>
          <p className="mt-2 text-sm text-white/60">
            New website orders appear under “Needs action”. Share the website link on WhatsApp and Instagram to get ordering!
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map(({ order, items }) => {
            const status = isOrderStatus(order.status) ? order.status : "pending";
            const meta = ORDER_STATUS[status];
            const customerWa = whatsappLink(
              order.customerPhone,
              `Hi ${order.customerName}, this is Danko Mkholwa about your order ${order.reference}.`,
            );
            return (
              <li key={order.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-smoke px-5 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-2xl text-white">{order.reference}</span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tone}`}>
                      {meta.label}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80">
                      {order.fulfilment}
                    </span>
                  </div>
                  <span className="text-xs text-white/50">{formatDateTimeZA(order.createdAt)}</span>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr_280px]">
                  <div className="text-sm">
                    <p className="font-semibold text-white">{order.customerName}</p>
                    <a href={customerWa} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">
                      {order.customerPhone} (WhatsApp)
                    </a>
                    {order.deliveryAddress && <p className="mt-2 text-white/75">📍 {order.deliveryAddress}</p>}
                    {order.deliveryZoneName && <p className="text-white/60">Area: {order.deliveryZoneName}</p>}
                    {order.specialInstructions && (
                      <p className="mt-2 rounded-xl bg-sun/10 p-2 text-sun">📝 {order.specialInstructions}</p>
                    )}
                    <form action={saveOrderNotes} className="mt-3 flex gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <input name="ownerNotes" defaultValue={order.ownerNotes ?? ""} placeholder="Private note (e.g. paid, driver)" className="input !py-1.5 text-xs" maxLength={500} />
                      <button type="submit" className="shrink-0 rounded-full border border-white/15 px-3 text-xs font-semibold hover:bg-white/10">Save</button>
                    </form>
                  </div>

                  <div className="text-sm">
                    <ul className="divide-y divide-white/10">
                      {items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 py-1.5">
                          <span>
                            <span className="font-semibold">{item.quantity} ×</span> {item.productName}
                            {item.selectedOptions.length > 0 && <span className="block text-xs text-white/55">{item.selectedOptions.join(", ")}</span>}
                            {item.extras.length > 0 && <span className="block text-xs text-white/55">+ {item.extras.map((e) => e.label).join(", ")}</span>}
                            {item.notes && <span className="block text-xs italic text-white/55">“{item.notes}”</span>}
                          </span>
                          <span>{formatZAR(item.lineTotalCents)}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-2 space-y-0.5 border-t border-white/10 pt-2 text-xs text-white/70">
                      <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatZAR(order.subtotalCents)}</dd></div>
                      {order.fulfilment === "delivery" && (
                        <div className="flex justify-between">
                          <dt>Delivery</dt>
                          <dd>{order.deliveryFeeConfirmed ? formatZAR(order.deliveryFeeCents) : "⚠ not set — confirm with customer"}</dd>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold text-white"><dt>Total</dt><dd className="text-gold">{formatZAR(order.totalCents)}</dd></div>
                    </dl>
                  </div>

                  <div>
                    {meta.next.length === 0 ? (
                      <p className="text-xs text-white/50">No further actions. {meta.customerText}</p>
                    ) : (
                      <form action={updateOrderStatus} className="space-y-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <p className="text-xs uppercase tracking-wider text-white/50">Update status</p>
                        {meta.next.map((next) => (
                          <button
                            key={next}
                            type="submit"
                            name="status"
                            value={next}
                            className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                              ACTION_STYLE[next] ?? "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            {next === "accepted" ? "✓ Accept order" : next === "rejected" ? "✗ Reject order" : `Mark ${ORDER_STATUS[next].label.toLowerCase()}`}
                          </button>
                        ))}
                        <input name="note" placeholder="Optional note" className="input !py-1.5 text-xs" maxLength={300} />
                      </form>
                    )}
                    <a href={customerWa} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-xs font-semibold text-[#25D366] hover:underline">
                      Message customer on WhatsApp →
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

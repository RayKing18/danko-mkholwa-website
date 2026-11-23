import type { Extra } from "@/db/schema";
import { formatZAR } from "./utils";

// ---- Order status workflow -------------------------------------------
// Orders are NEVER auto-accepted. They start as "pending" until the owner
// taps Accept or Reject in the dashboard.
export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "rejected"
  | "cancelled";

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; customerText: string; tone: string; next: OrderStatus[] }
> = {
  pending: {
    label: "Awaiting confirmation",
    customerText:
      "We have received your order request. It is NOT confirmed yet — Danko Mkholwa will confirm on WhatsApp.",
    tone: "bg-sun/15 text-sun border-sun/40",
    next: ["accepted", "rejected"],
  },
  accepted: {
    label: "Accepted",
    customerText: "Good news, chommie! Your order has been accepted.",
    tone: "bg-brand-teal/15 text-brand-teal border-brand-teal/40",
    next: ["preparing", "cancelled"],
  },
  preparing: {
    label: "Preparing",
    customerText: "Your food is being prepared right now.",
    tone: "bg-gold/15 text-gold border-gold/40",
    next: ["ready", "out_for_delivery", "cancelled"],
  },
  ready: {
    label: "Ready for collection",
    customerText: "Your order is ready for collection!",
    tone: "bg-brand-teal/15 text-brand-teal border-brand-teal/40",
    next: ["completed", "cancelled"],
  },
  out_for_delivery: {
    label: "Out for delivery",
    customerText: "Your order is on its way to you.",
    tone: "bg-brand-teal/15 text-brand-teal border-brand-teal/40",
    next: ["completed", "cancelled"],
  },
  completed: {
    label: "Completed",
    customerText: "Order completed. Danko — thank you for supporting us!",
    tone: "bg-white/10 text-white border-white/20",
    next: [],
  },
  rejected: {
    label: "Rejected",
    customerText:
      "Unfortunately we could not accept this order. Please WhatsApp us if you have questions.",
    tone: "bg-brand-red/15 text-brand-red border-brand-red/40",
    next: [],
  },
  cancelled: {
    label: "Cancelled",
    customerText: "This order was cancelled.",
    tone: "bg-brand-red/15 text-brand-red border-brand-red/40",
    next: [],
  },
};

export const ACTIVE_STATUSES: OrderStatus[] = [
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
];

export function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS;
}

/** Human-friendly reference like DM-7K2Q9X */
export function generateOrderReference(): string {
  // Pure JS (no Node crypto) so this file can also be bundled for the browser.
  // The API route re-checks the database for clashes before saving.
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 3; i++) rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `DM-${time}${rand}`.replace(/[^A-Z0-9-]/g, "X");
}

// ---- WhatsApp -------------------------------------------------------
export function toInternationalNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${toInternationalNumber(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export type MessageItem = {
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  selectedOptions: string[];
  extras: Extra[];
  notes?: string | null;
};

export function buildOrderMessage(input: {
  businessName: string;
  reference?: string | null;
  customerName: string;
  customerPhone: string;
  fulfilment: string;
  deliveryAddress?: string | null;
  deliveryZoneName?: string | null;
  deliveryFeeCents: number;
  deliveryFeeConfirmed: boolean;
  subtotalCents: number;
  totalCents: number;
  specialInstructions?: string | null;
  items: MessageItem[];
}): string {
  const lines: string[] = [];
  lines.push(`*NEW ORDER – ${input.businessName}*`);
  if (input.reference) lines.push(`Ref: ${input.reference}`);
  lines.push(`Name: ${input.customerName}`);
  lines.push(`Phone: ${input.customerPhone}`);
  lines.push(
    `Type: ${input.fulfilment === "delivery" ? "DELIVERY" : "COLLECTION"}`,
  );
  if (input.fulfilment === "delivery") {
    if (input.deliveryAddress) lines.push(`Address: ${input.deliveryAddress}`);
    if (input.deliveryZoneName) lines.push(`Area: ${input.deliveryZoneName}`);
  }
  lines.push("");
  lines.push("*Items*");
  for (const item of input.items) {
    lines.push(
      `${item.quantity} x ${item.productName} @ ${formatZAR(item.unitPriceCents)} = ${formatZAR(item.lineTotalCents)}`,
    );
    if (item.selectedOptions.length)
      lines.push(`   • ${item.selectedOptions.join(", ")}`);
    for (const extra of item.extras)
      lines.push(`   + ${extra.label} (${formatZAR(extra.priceCents)})`);
    if (item.notes) lines.push(`   Note: ${item.notes}`);
  }
  lines.push("");
  lines.push(`Subtotal: ${formatZAR(input.subtotalCents)}`);
  if (input.fulfilment === "delivery") {
    lines.push(
      `Delivery: ${
        input.deliveryFeeConfirmed
          ? formatZAR(input.deliveryFeeCents)
          : "to be confirmed"
      }`,
    );
  }
  lines.push(
    `*Total: ${formatZAR(input.totalCents)}${
      input.fulfilment === "delivery" && !input.deliveryFeeConfirmed
        ? " + delivery"
        : ""
    }*`,
  );
  if (input.specialInstructions) {
    lines.push("");
    lines.push(`Instructions: ${input.specialInstructions}`);
  }
  lines.push("");
  lines.push("Sent from the website. Please confirm my order 🙏");
  return lines.join("\n");
}

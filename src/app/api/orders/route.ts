import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  customers,
  orderItems,
  orderStatusHistory,
  orders,
  type Extra,
} from "@/db/schema";
import {
  buildOrderMessage,
  generateOrderReference,
  whatsappLink,
  type MessageItem,
} from "@/lib/orders";
import {
  getDeliveryZones,
  getOrderByClientKey,
  getProductsByIds,
  getSettings,
} from "@/lib/queries";
import { isValidSouthAfricanPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

type IncomingItem = {
  productId: number;
  quantity: number;
  selectedOptions?: string[];
  extras?: string[]; // extra labels
  notes?: string;
};

type IncomingOrder = {
  clientKey?: string;
  customerName?: string;
  phone?: string;
  fulfilment?: string;
  address?: string;
  deliveryZoneId?: number | null;
  instructions?: string;
  items?: IncomingItem[];
};

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  let body: IncomingOrder;
  try {
    body = (await request.json()) as IncomingOrder;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const settings = await getSettings();

  // ---- Validate customer details --------------------------------------
  const customerName = clean(body.customerName, 80);
  const phone = clean(body.phone, 20);
  const fulfilment = body.fulfilment === "delivery" ? "delivery" : "collection";
  const address = clean(body.address, 240);
  const instructions = clean(body.instructions, 400);

  if (customerName.length < 2)
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidSouthAfricanPhone(phone))
    return NextResponse.json(
      { error: "Please enter a valid South African cellphone number (e.g. 076 712 4232)." },
      { status: 400 },
    );
  if (!settings.acceptingOrders)
    return NextResponse.json(
      { error: "Online ordering is paused right now. Please WhatsApp us directly." },
      { status: 409 },
    );
  if (fulfilment === "delivery" && !settings.deliveryEnabled)
    return NextResponse.json({ error: "Delivery is not available right now." }, { status: 400 });
  if (fulfilment === "collection" && !settings.collectionEnabled)
    return NextResponse.json({ error: "Collection is not available right now." }, { status: 400 });
  if (fulfilment === "delivery" && address.length < 8)
    return NextResponse.json({ error: "Please enter your full delivery address." }, { status: 400 });

  // ---- Duplicate protection -------------------------------------------
  const clientKey = clean(body.clientKey, 64) || randomUUID();
  const existing = await getOrderByClientKey(clientKey);
  if (existing) {
    return NextResponse.json({ reference: existing.reference, duplicate: true });
  }

  // ---- Validate & re-price items from the database --------------------
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  if (rawItems.length === 0)
    return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });

  const productIds = [...new Set(rawItems.map((i) => Number(i.productId)).filter(Number.isInteger))];
  const dbProducts = await getProductsByIds(productIds);

  const lines: (MessageItem & { productId: number })[] = [];
  for (const raw of rawItems) {
    const product = dbProducts.find((p) => p.id === Number(raw.productId));
    if (!product) return NextResponse.json({ error: "One of the products no longer exists." }, { status: 400 });
    if (!product.isAvailable)
      return NextResponse.json({ error: `${product.name} is sold out right now.` }, { status: 409 });

    const quantity = Math.min(20, Math.max(1, Math.floor(Number(raw.quantity) || 1)));
    let unitPrice = product.priceCents;
    const selectedOptions: string[] = [];

    // Variations: each incoming "Group: Option" must match a real option
    for (const group of product.variations) {
      const wanted = (raw.selectedOptions ?? [])
        .map((s) => String(s))
        .find((s) => s.startsWith(`${group.name}: `));
      const label = wanted ? wanted.slice(group.name.length + 2) : group.options[0]?.label;
      const option = group.options.find((o) => o.label === label) ?? group.options[0];
      if (option) {
        unitPrice += option.priceDeltaCents;
        selectedOptions.push(`${group.name}: ${option.label}`);
      }
    }

    // Extras: only real extras from the product, priced from the database
    const extras: Extra[] = [];
    for (const label of raw.extras ?? []) {
      const extra = product.extras.find((e) => e.label === String(label));
      if (extra && !extras.some((e) => e.label === extra.label)) {
        extras.push(extra);
        unitPrice += extra.priceCents;
      }
    }

    lines.push({
      productId: product.id,
      productName: product.name,
      quantity,
      unitPriceCents: unitPrice,
      lineTotalCents: unitPrice * quantity,
      selectedOptions,
      extras,
      notes: clean(raw.notes, 200) || null,
    });
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

  // ---- Delivery fee from configured zones -----------------------------
  let deliveryFeeCents = 0;
  let deliveryFeeConfirmed = true;
  let deliveryZoneName: string | null = null;
  let deliveryZoneId: number | null = null;

  if (fulfilment === "delivery") {
    const zones = await getDeliveryZones(true);
    const zone = zones.find((z) => z.id === Number(body.deliveryZoneId));
    if (zone) {
      deliveryFeeCents = zone.feeCents;
      deliveryZoneName = zone.name;
      deliveryZoneId = zone.id;
    } else if (zones.length > 0) {
      return NextResponse.json({ error: "Please choose your delivery area." }, { status: 400 });
    } else {
      deliveryFeeConfirmed = false; // owner has not configured zones yet
    }
  }

  const totalCents = subtotalCents + deliveryFeeCents;

  // ---- Save everything in one transaction -----------------------------
  const saved = await db.transaction(async (tx) => {
    const [customer] = await tx
      .insert(customers)
      .values({ name: customerName, phone, lastOrderAt: new Date() })
      .onConflictDoUpdate({
        target: customers.phone,
        set: { name: customerName, lastOrderAt: new Date() },
      })
      .returning({ id: customers.id });

    let reference = generateOrderReference();
    for (let attempt = 0; attempt < 5; attempt++) {
      const [clash] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.reference, reference));
      if (!clash) break;
      reference = generateOrderReference();
    }

    const [order] = await tx
      .insert(orders)
      .values({
        reference,
        clientKey,
        customerId: customer?.id ?? null,
        customerName,
        customerPhone: phone,
        fulfilment,
        deliveryAddress: fulfilment === "delivery" ? address : null,
        deliveryZoneId,
        deliveryZoneName,
        deliveryFeeCents,
        deliveryFeeConfirmed,
        subtotalCents,
        totalCents,
        specialInstructions: instructions || null,
        status: "pending",
      })
      .returning();

    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: order.id,
        productId: line.productId,
        productName: line.productName,
        unitPriceCents: line.unitPriceCents,
        quantity: line.quantity,
        selectedOptions: line.selectedOptions,
        extras: line.extras,
        notes: line.notes,
        lineTotalCents: line.lineTotalCents,
      })),
    );

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      fromStatus: null,
      toStatus: "pending",
      note: "Order placed on the website",
      changedBy: "customer",
    });

    return order;
  });

  const message = buildOrderMessage({
    businessName: settings.businessName,
    reference: saved.reference,
    customerName,
    customerPhone: phone,
    fulfilment,
    deliveryAddress: saved.deliveryAddress,
    deliveryZoneName,
    deliveryFeeCents,
    deliveryFeeConfirmed,
    subtotalCents,
    totalCents,
    specialInstructions: instructions,
    items: lines,
  });

  return NextResponse.json({
    reference: saved.reference,
    whatsappUrl: whatsappLink(settings.whatsappNumber, message),
  });
}

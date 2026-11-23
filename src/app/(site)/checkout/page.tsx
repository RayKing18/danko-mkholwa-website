import type { Metadata } from "next";
import { CheckoutForm } from "@/components/basket/CheckoutForm";
import { Container, GeoBorder } from "@/components/ui";
import { getDeliveryZones, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [settings, zones] = await Promise.all([getSettings(), getDeliveryZones(true)]);

  return (
    <Container className="py-12">
      <p className="font-script text-2xl text-gold">{settings.callToAction}</p>
      <h1 className="font-display text-6xl leading-none text-white">Checkout</h1>
      <GeoBorder className="mb-10 mt-4" />
      <CheckoutForm
        businessName={settings.businessName}
        whatsappNumber={settings.whatsappNumber}
        acceptingOrders={settings.acceptingOrders}
        deliveryEnabled={settings.deliveryEnabled}
        collectionEnabled={settings.collectionEnabled}
        deliveryNote={settings.deliveryNote}
        zones={zones}
      />
    </Container>
  );
}

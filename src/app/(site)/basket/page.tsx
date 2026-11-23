import type { Metadata } from "next";
import { BasketView } from "@/components/basket/BasketView";
import { Container, GeoBorder } from "@/components/ui";

export const metadata: Metadata = { title: "Your basket" };

export default function BasketPage() {
  return (
    <Container className="py-12">
      <p className="font-script text-2xl text-gold">Almost there, chommie</p>
      <h1 className="font-display text-6xl leading-none text-white">Your Basket</h1>
      <GeoBorder className="mb-10 mt-4" />
      <BasketView />
    </Container>
  );
}

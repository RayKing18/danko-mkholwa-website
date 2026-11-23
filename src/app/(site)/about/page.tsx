import type { Metadata } from "next";
import { BrandImage, Logo } from "@/components/BrandImage";
import { Container, GeoBorder, LinkButton } from "@/components/ui";
import { getPromoProduct, getSettings } from "@/lib/queries";
import { ASSETS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [settings, promo] = await Promise.all([getSettings(), getPromoProduct()]);

  return (
    <Container className="py-12">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="font-script text-2xl text-gold">Our story</p>
          <h1 className="font-display text-6xl leading-none text-white">About {settings.businessName}</h1>
          <GeoBorder className="mt-4" />
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-white/80">{settings.aboutText}</p>
          <p className="mt-6 font-script text-3xl text-sun">{settings.slogan}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/menu" size="lg">{settings.callToAction.toUpperCase()}</LinkButton>
            <LinkButton href="/contact" variant="secondary" size="lg">Contact us</LinkButton>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card flex items-center justify-center bg-glow p-10">
            <Logo src={settings.logoUrl} className="h-48" />
          </div>
          <BrandImage
            src={promo?.imageUrl ?? ASSETS.promoPoster}
            alt={promo?.name ?? "Danko Mkholwa"}
            className="aspect-[4/3] w-full rounded-[2rem] border border-gold/30"
          />
        </div>
      </div>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          { icon: "🏰", title: "Danko is thank you", text: "Our name is a thank you to every customer who supports a small business from Section 4." },
          { icon: "🍔", title: "Food first", text: "Big, honest flavour: burgers, loaded fries and ice-cold mocktails made fresh for every order." },
          { icon: "🇿🇦", title: "Proudly Newcastle", text: `Based at ${settings.address}. Collection and delivery in ${settings.deliveryAreaText}` },
        ].map((item) => (
          <div key={item.title} className="card p-7">
            <p className="text-4xl" aria-hidden="true">{item.icon}</p>
            <h2 className="mt-3 font-display text-3xl text-gold">{item.title}</h2>
            <p className="mt-2 text-white/70">{item.text}</p>
          </div>
        ))}
      </section>
    </Container>
  );
}

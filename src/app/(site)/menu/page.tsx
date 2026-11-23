import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { Container, GeoBorder, LinkButton, WhatsAppIcon } from "@/components/ui";
import { whatsappLink } from "@/lib/orders";
import { getMenu, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Burgers, loaded fries, mocktails & drinks and combos from Danko Mkholwa, Newcastle KZN.",
};

export default async function MenuPage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);

  return (
    <>
      <section className="bg-glow bg-tiles border-b border-gold/20">
        <Container className="py-12 text-center">
          <p className="font-script text-2xl text-gold">{settings.slogan}</p>
          <h1 className="mt-1 font-display text-6xl leading-none text-white sm:text-7xl">
            Our Menu
          </h1>
          <GeoBorder className="mx-auto mt-4" />
          {!settings.acceptingOrders && (
            <p className="mx-auto mt-6 max-w-md rounded-2xl border border-brand-red/40 bg-brand-red/10 px-4 py-3 text-sm text-white">
              Online ordering is paused right now. You can still WhatsApp us on{" "}
              {settings.whatsappNumber}.
            </p>
          )}
          {/* Category chips */}
          <nav
            aria-label="Menu categories"
            className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1 sm:justify-center"
          >
            {menu.map(({ category, products }) => (
              <a
                key={category.id}
                href={`#${category.slug}`}
                className="shrink-0 rounded-full border border-gold/40 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold hover:text-ink"
              >
                {category.name}
                <span className="ml-1 text-xs opacity-60">({products.length})</span>
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <Container className="space-y-20 py-14">
        {menu.map(({ category, products }) => (
          <section key={category.id} id={category.slug} aria-labelledby={`${category.slug}-title`}>
            <div className="mb-8">
              <h2
                id={`${category.slug}-title`}
                className="font-display text-5xl leading-none text-white"
              >
                <span className="brush">{category.name}</span>
              </h2>
              {category.description && (
                <p className="mt-4 text-white/65">{category.description}</p>
              )}
            </div>

            {products.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="font-display text-3xl text-gold">
                  We&apos;re just getting started!
                </p>
                <p className="mt-2 text-white/70">
                  More deliciousness coming soon… More exciting products and flavours are on the way!
                </p>
                <p className="mt-4 text-sm text-white/50">
                  Ask us on WhatsApp what&apos;s available today.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="card bg-glow p-8 text-center sm:p-12">
          <p className="font-script text-2xl text-gold">Can&apos;t find what you want?</p>
          <h2 className="mt-1 font-display text-5xl text-white">Ask us on WhatsApp</h2>
          <p className="mx-auto mt-3 max-w-md text-white/65">
            Platters and new products are on the way. Send us a message and we&apos;ll sort you out, chommie.
          </p>
          <LinkButton
            href={whatsappLink(settings.whatsappNumber, "Hi Danko Mkholwa! What's available today?")}
            external
            variant="whatsapp"
            size="lg"
            className="mt-6"
          >
            <WhatsAppIcon /> {settings.whatsappNumber}
          </LinkButton>
        </section>
      </Container>
    </>
  );
}

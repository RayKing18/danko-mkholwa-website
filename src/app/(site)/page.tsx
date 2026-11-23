import Link from "next/link";
import { AddToBasketButton } from "@/components/basket/AddToBasketButton";
import { BrandImage, Logo } from "@/components/BrandImage";
import { ProductCard } from "@/components/ProductCard";
import {
  Badge,
  Container,
  GeoBorder,
  InstagramIcon,
  LinkButton,
  Price,
  SectionHeading,
  WhatsAppIcon,
} from "@/components/ui";
import { describeHours, isOpenNow } from "@/lib/hours";
import { whatsappLink } from "@/lib/orders";
import {
  getApprovedGallery,
  getCategories,
  getFeaturedProducts,
  getPromoProduct,
  getSettings,
} from "@/lib/queries";
import { ASSETS, formatZAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, string> = {
  burgers: "🍔",
  "loaded-fries": "🍟",
  "mocktails-drinks": "🍹",
  "combos-meal-deals": "🍽️",
};

export default async function HomePage() {
  const [settings, promo, featured, categories, gallery] = await Promise.all([
    getSettings(),
    getPromoProduct(),
    getFeaturedProducts(6),
    getCategories(),
    getApprovedGallery(6),
  ]);
  const open = isOpenNow(settings.openingHours);
  const wa = whatsappLink(
    settings.whatsappNumber,
    "Hi Danko Mkholwa! I'd like to place an order, chommie.",
  );
  const heroImage = settings.heroImageUrl ?? promo?.imageUrl ?? null;

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="bg-glow bg-tiles relative overflow-hidden">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="text-center lg:text-left">
            <Logo src={settings.logoUrl} className="mx-auto h-36 sm:h-44 lg:mx-0" priority />
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
              <span className={`h-2 w-2 rounded-full ${open ? "bg-brand-teal" : "bg-brand-red"}`} />
              {open ? "Open now" : "Closed now"} · Daily 08:00 – 20:00 · Newcastle, KZN
            </p>
            <h1 className="mt-5 font-display text-6xl leading-[0.9] text-white sm:text-7xl lg:text-8xl">
              <span className="text-gold-gradient">Flavour</span> that feels
              <br />
              like home.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/75 lg:mx-0">
              Discover great food and refreshing drinks from Danko Mkholwa.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <LinkButton href="/menu" size="lg" className="w-full sm:w-auto">
                {settings.callToAction.toUpperCase()}
              </LinkButton>
              <LinkButton href="/menu" variant="secondary" size="lg" className="w-full sm:w-auto">
                EXPLORE OUR MENU
              </LinkButton>
            </div>
            <GeoBorder className="mx-auto mt-8 lg:mx-0" />
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-6 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
            <BrandImage
              src={heroImage}
              alt={promo?.name ?? "Danko Mkholwa food"}
              label="Danko Mkholwa"
              className="relative aspect-square w-full rounded-[2rem] border border-gold/30 shadow-gold"
            />
            {promo && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/90 px-5 py-2 text-sm font-semibold text-white backdrop-blur">
                {promo.name} · <span className="text-gold">{formatZAR(promo.priceCents)}</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ---------------- FEATURED PROMOTION ---------------- */}
      {promo && (
        <section className="py-16">
          <Container>
            <div className="card relative grid overflow-hidden lg:grid-cols-2">
              <BrandImage
                src={promo.imageUrl ?? ASSETS.promoPoster}
                alt={promo.name}
                className="aspect-[4/3] w-full lg:aspect-auto lg:h-full"
              />
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <Badge tone="red" className="w-fit">Featured special</Badge>
                <p className="mt-5 font-script text-3xl text-white">Danko Is Thank You</p>
                <h2 className="font-display text-6xl leading-[0.9] text-gold-gradient sm:text-7xl">
                  {promo.name.replace(/^Danko Is Thank You\s*/i, "")}
                </h2>
                <p className="mt-5 text-3xl font-black uppercase">
                  <span className="brush font-display text-5xl">ONLY {formatZAR(promo.priceCents)}</span>
                </p>
                {promo.promoTagline && (
                  <p className="mt-6 font-script text-2xl text-sun">{promo.promoTagline}</p>
                )}
                {promo.description && (
                  <p className="mt-3 max-w-md text-white/70">{promo.description}</p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <AddToBasketButton product={promo} size="lg" />
                  <Link href={`/menu/${promo.slug}`} className="text-sm font-semibold uppercase tracking-wider text-gold hover:text-sun">
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="py-8">
        <Container>
          <SectionHeading eyebrow="Our Menu" title="What are you craving, chommie?" align="center" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/menu#${category.slug}`}
                className="card group flex flex-col items-center p-6 text-center transition hover:-translate-y-1 hover:border-gold/60"
              >
                <span className="text-5xl transition group-hover:scale-110" aria-hidden="true">
                  {CATEGORY_ICONS[category.slug] ?? "⭐"}
                </span>
                <h3 className="mt-4 font-display text-2xl leading-tight text-white group-hover:text-sun">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-1 text-xs text-white/55">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- FEATURED PRODUCTS ---------------- */}
      {featured.length > 0 && (
        <section className="py-16">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Customer favourites" title="Featured products" />
              <Link href="/menu" className="mb-8 text-sm font-semibold uppercase tracking-wider text-gold hover:text-sun">
                Full menu →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---------------- HOURS / DELIVERY / ABOUT ---------------- */}
      <section className="bg-coal py-16">
        <Container className="grid gap-8 lg:grid-cols-3">
          <div className="card bg-smoke p-7">
            <p className="text-3xl" aria-hidden="true">🕗</p>
            <h3 className="mt-3 font-display text-3xl text-gold">Opening hours</h3>
            <ul className="mt-3 space-y-1 text-white/75">
              {describeHours(settings.openingHours).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className={`mt-4 text-sm font-bold uppercase tracking-wider ${open ? "text-brand-teal" : "text-brand-red"}`}>
              {open ? "● We're open right now" : "● Currently closed — order ahead on WhatsApp"}
            </p>
          </div>
          <div className="card bg-smoke p-7">
            <p className="text-3xl" aria-hidden="true">🛵</p>
            <h3 className="mt-3 font-display text-3xl text-gold">Delivery & collection</h3>
            <ul className="mt-3 space-y-2 text-white/75">
              {settings.collectionEnabled && (
                <li>✔ Collect from Section 4, Newcastle</li>
              )}
              {settings.deliveryEnabled && <li>✔ Delivery to {settings.deliveryAreaText}</li>}
              <li>✔ Order online or on WhatsApp</li>
            </ul>
            {settings.deliveryNote && (
              <p className="mt-4 text-sm text-white/55">{settings.deliveryNote}</p>
            )}
          </div>
          <div className="card bg-smoke p-7">
            <p className="text-3xl" aria-hidden="true">🏰</p>
            <h3 className="mt-3 font-display text-3xl text-gold">About Danko Mkholwa</h3>
            <p className="mt-3 line-clamp-5 text-white/75">{settings.aboutText}</p>
            <Link href="/about" className="mt-4 inline-block text-sm font-semibold uppercase tracking-wider text-gold hover:text-sun">
              Our story →
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------------- GALLERY PREVIEW ---------------- */}
      <section className="py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Eat good. Feel good." title="Gallery" />
            <Link href="/gallery" className="mb-8 text-sm font-semibold uppercase tracking-wider text-gold hover:text-sun">
              See all →
            </Link>
          </div>
          {gallery.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="font-display text-3xl text-white">Photos coming soon</p>
              <p className="mt-2 text-white/60">
                Enjoyed your meal? Share a photo on our gallery page — the owner approves every picture before it goes live.
              </p>
              <LinkButton href="/gallery" variant="secondary" className="mt-6">
                Share a photo
              </LinkButton>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {gallery.map((item) => (
                <BrandImage
                  key={item.id}
                  src={item.imageUrl}
                  alt={item.caption ?? "Danko Mkholwa"}
                  className="aspect-square rounded-2xl border border-white/10"
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ---------------- CONTACT / CTA ---------------- */}
      <section className="bg-glow py-16">
        <Container className="text-center">
          <p className="font-script text-3xl text-gold">{settings.slogan}</p>
          <h2 className="mt-2 font-display text-6xl leading-none text-white sm:text-7xl">
            {settings.callToAction.toUpperCase()}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            {settings.address}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href={wa} external variant="whatsapp" size="lg">
              <WhatsAppIcon /> WhatsApp {settings.whatsappNumber}
            </LinkButton>
            <LinkButton
              href={`https://instagram.com/${settings.instagramHandle}`}
              external
              variant="secondary"
              size="lg"
            >
              <InstagramIcon /> @{settings.instagramHandle}
            </LinkButton>
          </div>
          {promo && (
            <p className="mt-8 text-sm text-white/50">
              Try the {promo.name} — <Price cents={promo.priceCents} className="text-xl" />
            </p>
          )}
        </Container>
      </section>
    </>
  );
}

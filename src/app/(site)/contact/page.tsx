import type { Metadata } from "next";
import { BrandImage } from "@/components/BrandImage";
import { Container, GeoBorder, InstagramIcon, LinkButton, WhatsAppIcon } from "@/components/ui";
import { describeHours, isOpenNow } from "@/lib/hours";
import { whatsappLink } from "@/lib/orders";
import { getSettings } from "@/lib/queries";
import { ASSETS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();
  const open = isOpenNow(settings.openingHours);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

  return (
    <Container className="py-12">
      <p className="font-script text-2xl text-gold">Let&apos;s talk, chommie</p>
      <h1 className="font-display text-6xl leading-none text-white">Contact</h1>
      <GeoBorder className="mt-4" />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="card p-7">
          <WhatsAppIcon className="h-8 w-8 text-[#25D366]" />
          <h2 className="mt-3 font-display text-3xl text-white">WhatsApp</h2>
          <p className="mt-1 text-white/70">Fastest way to order and ask questions.</p>
          <p className="mt-3 font-display text-3xl text-gold">{settings.whatsappNumber}</p>
          <LinkButton href={whatsappLink(settings.whatsappNumber, "Hi Danko Mkholwa!")} external variant="whatsapp" className="mt-4">
            Chat on WhatsApp
          </LinkButton>
        </div>
        <div className="card p-7">
          <InstagramIcon className="h-8 w-8 text-sun" />
          <h2 className="mt-3 font-display text-3xl text-white">Instagram</h2>
          <p className="mt-1 text-white/70">Follow for specials and new flavours.</p>
          <p className="mt-3 font-display text-3xl text-gold">@{settings.instagramHandle}</p>
          <LinkButton href={`https://instagram.com/${settings.instagramHandle}`} external variant="secondary" className="mt-4">
            Follow us
          </LinkButton>
        </div>
        <div className="card p-7">
          <p className="text-3xl" aria-hidden="true">📍</p>
          <h2 className="mt-3 font-display text-3xl text-white">Visit us</h2>
          <p className="mt-1 text-white/70">{settings.address}</p>
          <ul className="mt-3 text-sm text-white/70">
            {describeHours(settings.openingHours).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${open ? "text-brand-teal" : "text-brand-red"}`}>
            {open ? "● Open now" : "● Closed now"}
          </p>
          <LinkButton href={mapsHref} external variant="ghost" size="sm" className="mt-3 border border-white/15">
            Open in Google Maps
          </LinkButton>
        </div>
      </div>

      <section className="mt-16 grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-5xl text-white">Our menu poster</h2>
          <GeoBorder className="mt-3" />
          <p className="mt-4 text-white/70">
            Save or share the poster with friends and family. Scan the QR code in store or WhatsApp us the words
            <span className="font-script text-xl text-gold"> “{settings.callToAction}”</span>
          </p>
          <LinkButton href="/menu" size="lg" className="mt-6">View the online menu</LinkButton>
        </div>
        <BrandImage
          src={ASSETS.menuPoster}
          alt="Danko Mkholwa menu poster"
          label="Menu poster"
          className="aspect-[2/3] w-full max-w-sm justify-self-center rounded-[1.5rem] border border-gold/30"
          imgClassName="object-contain"
        />
      </section>
    </Container>
  );
}

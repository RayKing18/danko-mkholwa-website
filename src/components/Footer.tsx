import Link from "next/link";
import type { Settings } from "@/lib/queries";
import { describeHours } from "@/lib/hours";
import { whatsappLink } from "@/lib/orders";
import { NAV_LINKS } from "@/lib/utils";
import { Logo } from "./BrandImage";
import { GeoBorder, InstagramIcon, WhatsAppIcon } from "./ui";

export function Footer({ settings }: { settings: Settings }) {
  const wa = whatsappLink(settings.whatsappNumber);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-gold/20 bg-coal">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo src={settings.logoUrl} className="h-20" />
          <p className="mt-4 font-script text-2xl text-gold">{settings.slogan}</p>
          <GeoBorder className="mt-4 max-w-[180px]" />
        </div>

        <div>
          <h3 className="font-display text-xl tracking-wider text-gold">Find us</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{settings.address}</p>
          <p className="mt-3 text-sm text-white/70">
            Delivery: {settings.deliveryAreaText}
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-wider text-gold">Opening hours</h3>
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            {describeHours(settings.openingHours).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h3 className="mt-5 font-display text-xl tracking-wider text-gold">Order & chat</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/80 hover:text-[#25D366]"
            >
              <WhatsAppIcon className="h-4 w-4" /> {settings.whatsappNumber}
            </a>
            <a
              href={`https://instagram.com/${settings.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/80 hover:text-sun"
            >
              <InstagramIcon className="h-4 w-4" /> @{settings.instagramHandle}
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-wider text-gold">Quick links</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/70">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-sun">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/basket" className="hover:text-sun">
                Basket
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-sun">
                Checkout
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {settings.businessName}. Newcastle, KwaZulu-Natal. All prices in ZAR.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-script text-base text-gold">{settings.callToAction}</span>
            <Link href="/admin/login" className="hover:text-white/80">
              Owner login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FloatingWhatsApp({ number }: { number: string }) {
  return (
    <a
      href={whatsappLink(number, "Hi Danko Mkholwa! I'd like to place an order, chommie.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-ink shadow-lg transition hover:scale-105 sm:h-16 sm:w-16"
      aria-label="Order on WhatsApp"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

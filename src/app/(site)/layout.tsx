import type { ReactNode } from "react";
import Script from "next/script";
import { FloatingWhatsApp, Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isOpenNow } from "@/lib/hours";
import { whatsappLink } from "@/lib/orders";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Customer-facing chrome: header, footer and the floating WhatsApp button. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  const open = isOpenNow(settings.openingHours);

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-LWQXXD64CE"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LWQXXD64CE');
        `}
      </Script>

      <Header
        logoUrl={settings.logoUrl}
        isOpen={open}
        whatsappHref={whatsappLink(settings.whatsappNumber)}
        callToAction={settings.callToAction}
      />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp number={settings.whatsappNumber} />
    </>
  );
}
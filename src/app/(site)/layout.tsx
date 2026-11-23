import type { ReactNode } from "react";
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

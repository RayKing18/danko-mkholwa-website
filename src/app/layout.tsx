import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BasketProvider } from "@/components/basket/BasketProvider";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Danko Mkholwa — Flavour That Feels Like Home | Newcastle, KZN",
    template: "%s | Danko Mkholwa",
  },
  description:
    "Order burgers, loaded fries and refreshing mocktails from Danko Mkholwa in Section 4, Newcastle, KwaZulu-Natal. Order, Chommie!",
  applicationName: "Danko Mkholwa",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Danko Mkholwa", statusBarStyle: "black" },
  icons: {
    icon: "/api/icon/192",
    apple: "/api/icon/180",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Kaushan+Script&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink text-white antialiased">
        <BasketProvider>
          {children}
          <PwaRegister />
        </BasketProvider>
      </body>
    </html>
  );
}

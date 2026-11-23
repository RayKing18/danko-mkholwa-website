"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/utils";
import { Logo } from "./BrandImage";
import { useBasket } from "./basket/BasketProvider";
import { buttonClass, WhatsAppIcon } from "./ui";

export function Header({
  logoUrl,
  isOpen,
  whatsappHref,
  callToAction,
}: {
  logoUrl: string | null;
  isOpen: boolean;
  whatsappHref: string;
  callToAction: string;
}) {
  const pathname = usePathname();
  const { count, hydrated } = useBasket();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Danko Mkholwa home">
          <Logo src={logoUrl} className="h-14 sm:h-16" priority />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-white/10 text-sun" : "text-white/80 hover:text-sun"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider md:inline-flex ${
              isOpen
                ? "border-brand-teal/50 text-brand-teal"
                : "border-brand-red/50 text-brand-red"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isOpen ? "bg-brand-teal" : "bg-brand-red"}`}
            />
            {isOpen ? "Open now" : "Closed now"}
          </span>

          <Link href="/menu" className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
            {callToAction}
          </Link>

          <Link
            href="/basket"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-ink"
            aria-label={`Basket, ${count} items`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path d="M3 6h18l-2 12H5L3 6z" />
              <path d="M8 6a4 4 0 018 0" />
            </svg>
            {hydrated && count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          className="border-t border-gold/20 bg-ink px-4 pb-6 pt-3 lg:hidden"
          aria-label="Mobile"
        >
          <div className="mb-3 flex items-center justify-between">
            <Logo src={logoUrl} className="h-12" />
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isOpen ? "text-brand-teal" : "text-brand-red"
              }`}
            >
              {isOpen ? "● Open now" : "● Closed now"}
            </span>
          </div>
          <ul className="divide-y divide-white/10">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-3 font-display text-2xl tracking-wide text-white hover:text-sun"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/menu" className={buttonClass("primary", "md")}>
              {callToAction}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("whatsapp", "md")}
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

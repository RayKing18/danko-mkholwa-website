"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Orders", badge: "orders" as const },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Upload Centre" },
  { href: "/admin/community", label: "Gallery & Reviews", badge: "moderation" as const },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({
  pendingOrders,
  pendingModeration,
}: {
  pendingOrders: number;
  pendingModeration: number;
}) {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6" aria-label="Dashboard">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        const badge =
          link.badge === "orders" ? pendingOrders : link.badge === "moderation" ? pendingModeration : 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active ? "bg-gold text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {link.label}
            {badge > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-ink text-gold" : "bg-brand-red text-white"}`}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

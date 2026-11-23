import Link from "next/link";
import type { ReactNode } from "react";
import { logoutOwner } from "@/app/admin/actions";
import { Logo } from "@/components/BrandImage";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { countPendingModeration, getDashboardStats, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const [settings, stats, moderation] = await Promise.all([
    getSettings(),
    getDashboardStats(),
    countPendingModeration(),
  ]);

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-coal/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo src={settings.logoUrl} className="h-11" />
            <span className="hidden font-display text-xl tracking-wider text-gold sm:inline">
              Owner dashboard
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span
              className={`hidden rounded-full border px-3 py-1 font-bold uppercase tracking-wider sm:inline ${
                settings.acceptingOrders
                  ? "border-brand-teal/50 text-brand-teal"
                  : "border-brand-red/50 text-brand-red"
              }`}
            >
              {settings.acceptingOrders ? "Accepting orders" : "Orders paused"}
            </span>
            <Link href="/" className="text-white/60 hover:text-white">View site</Link>
            <form action={logoutOwner}>
              <button type="submit" className="rounded-full border border-white/15 px-3 py-1.5 font-semibold text-white/80 hover:bg-white/10">
                Log out
              </button>
            </form>
          </div>
        </div>
        <AdminNav
          pendingOrders={stats.pending}
          pendingModeration={moderation.gallery + moderation.reviews}
        />
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}

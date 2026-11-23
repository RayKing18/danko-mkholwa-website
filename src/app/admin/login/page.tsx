import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginOwner, setupOwnerPassword } from "@/app/admin/actions";
import { Logo } from "@/components/BrandImage";
import { Button, GeoBorder } from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner login", robots: { index: false } };

const ERRORS: Record<string, string> = {
  invalid: "Incorrect password. Please try again.",
  ratelimit: "Too many attempts. Please wait 15 minutes and try again.",
  short: "Password must be at least 8 characters.",
  match: "The two passwords do not match.",
  exists: "An owner password already exists. Please log in.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) redirect("/admin");
  const [{ error }, settings] = await Promise.all([searchParams, getSettings()]);
  const needsSetup = !settings.adminPasswordHash;

  return (
    <div className="bg-glow bg-tiles flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <Link href="/" className="block">
          <Logo src={settings.logoUrl} className="mx-auto h-24" priority />
        </Link>
        <GeoBorder className="mx-auto mt-4 max-w-[200px]" />
        <h1 className="mt-6 text-center font-display text-4xl text-white">
          {needsSetup ? "Create owner password" : "Owner login"}
        </h1>
        <p className="mt-2 text-center text-sm text-white/60">
          {needsSetup
            ? "First time here. Choose a strong password for the Danko Mkholwa dashboard. Keep it private."
            : "Manage orders, menu, photos and settings."}
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-sm">
            {ERRORS[error] ?? "Something went wrong."}
          </p>
        )}

        {needsSetup ? (
          <form action={setupOwnerPassword} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="password">New password</label>
              <input id="password" name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="confirm">Confirm password</label>
              <input id="confirm" name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" />
            </div>
            <Button type="submit" size="lg" className="w-full">Create password & enter</Button>
          </form>
        ) : (
          <form action={loginOwner} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input" required autoComplete="current-password" />
            </div>
            <Button type="submit" size="lg" className="w-full">Log in</Button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-white/40">
          <Link href="/" className="hover:text-white">← Back to the website</Link>
        </p>
      </div>
    </div>
  );
}

import {
  changeOwnerPassword,
  deleteDeliveryZone,
  saveBusinessSettings,
  saveDeliveryZone,
  saveOpeningHours,
} from "@/app/admin/actions";
import { Button, buttonClass } from "@/components/ui";
import { DAYS } from "@/lib/hours";
import { getDeliveryZones, getSettings } from "@/lib/queries";
import { formatZAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  business: "Business details saved.",
  hours: "Opening hours saved.",
  zone: "Delivery zone saved.",
  password: "Password changed.",
};
const ERRORS: Record<string, string> = {
  zone: "Please give the delivery zone a name and a valid fee.",
  current: "Your current password was incorrect.",
  short: "New password must be at least 8 characters.",
  match: "The new passwords do not match.",
};

function Toggle({ name, label, hint, checked }: { name: string; label: string; hint: string; checked: boolean }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-white/15 p-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-0.5 h-4 w-4 accent-gold" />
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="text-xs text-white/55">{hint}</span>
      </span>
    </label>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ saved, error }, settings, zones] = await Promise.all([
    searchParams,
    getSettings(),
    getDeliveryZones(false),
  ]);

  return (
    <>
      <p className="font-script text-xl text-gold">Restaurant settings</p>
      <h1 className="font-display text-5xl leading-none text-white">Settings</h1>

      {saved && <p className="mt-4 rounded-xl border border-brand-teal/40 bg-brand-teal/10 p-3 text-sm">{MESSAGES[saved] ?? "Saved."}</p>}
      {error && <p className="mt-4 rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-sm">{ERRORS[error] ?? "Something went wrong."}</p>}

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        {/* ---------------- Business details ---------------- */}
        <form action={saveBusinessSettings} className="card space-y-4 p-6" id="business">
          <h2 className="font-display text-3xl text-white">Business details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Business name</label><input name="businessName" className="input" defaultValue={settings.businessName} maxLength={80} /></div>
            <div><label className="label">Slogan</label><input name="slogan" className="input" defaultValue={settings.slogan} maxLength={120} /></div>
            <div><label className="label">Call to action</label><input name="callToAction" className="input" defaultValue={settings.callToAction} maxLength={60} /></div>
            <div><label className="label">WhatsApp number</label><input name="whatsappNumber" className="input" defaultValue={settings.whatsappNumber} maxLength={20} /></div>
            <div><label className="label">Instagram handle</label><input name="instagramHandle" className="input" defaultValue={settings.instagramHandle} maxLength={60} /></div>
            <div><label className="label">Delivery area (short)</label><input name="deliveryAreaText" className="input" defaultValue={settings.deliveryAreaText} maxLength={200} /></div>
          </div>
          <div><label className="label">Address</label><input name="address" className="input" defaultValue={settings.address} maxLength={240} /></div>
          <div><label className="label">About text (About page & homepage)</label><textarea name="aboutText" className="input" rows={5} defaultValue={settings.aboutText} maxLength={2000} /></div>
          <div><label className="label">Delivery note shown at checkout</label><input name="deliveryNote" className="input" defaultValue={settings.deliveryNote ?? ""} maxLength={300} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle name="acceptingOrders" label="Accepting online orders" hint="Untick to pause the website checkout (WhatsApp still works)." checked={settings.acceptingOrders} />
            <Toggle name="collectionEnabled" label="Collection" hint="Customers can collect from Section 4." checked={settings.collectionEnabled} />
            <Toggle name="deliveryEnabled" label="Delivery" hint="Customers can request delivery." checked={settings.deliveryEnabled} />
          </div>
          <Button type="submit">Save business details</Button>
        </form>

        {/* ---------------- Opening hours ---------------- */}
        <form action={saveOpeningHours} className="card space-y-4 p-6" id="hours">
          <h2 className="font-display text-3xl text-white">Opening hours</h2>
          <p className="text-xs text-white/50">Times are in South African time (Africa/Johannesburg). They drive the “Open now” badge.</p>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const value = settings.openingHours[day.key];
              return (
                <div key={day.key} className="grid grid-cols-[90px_1fr_1fr_auto] items-center gap-2 text-sm">
                  <span className="font-semibold">{day.label}</span>
                  <input type="time" name={`${day.key}-open`} defaultValue={value.open} className="input !py-1.5" />
                  <input type="time" name={`${day.key}-close`} defaultValue={value.close} className="input !py-1.5" />
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" name={`${day.key}-closed`} defaultChecked={value.closed} className="accent-gold" /> Closed
                  </label>
                </div>
              );
            })}
          </div>
          <Button type="submit">Save opening hours</Button>
        </form>

        {/* ---------------- Delivery zones ---------------- */}
        <section className="card space-y-4 p-6" id="delivery">
          <h2 className="font-display text-3xl text-white">Delivery zones & fees</h2>
          <p className="text-xs text-white/50">
            Customers choose a zone at checkout and the fee is added automatically. If you have no zones, delivery orders show “fee to be confirmed on WhatsApp”.
          </p>
          <ul className="space-y-2">
            {zones.map((zone) => (
              <li key={zone.id} className="rounded-xl border border-white/10 p-3">
                <form action={saveDeliveryZone} className="grid gap-2 sm:grid-cols-[1fr_90px_1fr_auto] sm:items-end">
                  <input type="hidden" name="id" value={zone.id} />
                  <input type="hidden" name="sortOrder" value={zone.sortOrder} />
                  <div><label className="label">Zone</label><input name="name" className="input !py-1.5" defaultValue={zone.name} required /></div>
                  <div><label className="label">Fee (R)</label><input name="fee" className="input !py-1.5" defaultValue={(zone.feeCents / 100).toString()} required inputMode="decimal" /></div>
                  <div><label className="label">Note</label><input name="description" className="input !py-1.5" defaultValue={zone.description ?? ""} maxLength={160} /></div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="isActive" defaultChecked={zone.isActive} className="accent-gold" /> Active</label>
                    <Button type="submit" size="sm" variant="secondary">Save</Button>
                  </div>
                </form>
                <div className="mt-1 flex justify-between text-xs text-white/40">
                  <span>Currently {formatZAR(zone.feeCents)}{zone.isActive ? "" : " · inactive"}</span>
                  <form action={deleteDeliveryZone}>
                    <input type="hidden" name="id" value={zone.id} />
                    <button type="submit" className="text-brand-red hover:underline">Delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <form action={saveDeliveryZone} className="grid gap-2 rounded-xl border border-dashed border-gold/40 p-3 sm:grid-cols-[1fr_90px_1fr_auto] sm:items-end">
            <input type="hidden" name="sortOrder" value={zones.length + 1} />
            <input type="hidden" name="isActive" value="on" />
            <div><label className="label">New zone</label><input name="name" className="input !py-1.5" placeholder="e.g. Section 4 / Madadeni" required /></div>
            <div><label className="label">Fee (R)</label><input name="fee" className="input !py-1.5" placeholder="20" required inputMode="decimal" /></div>
            <div><label className="label">Note</label><input name="description" className="input !py-1.5" placeholder="Optional" maxLength={160} /></div>
            <button type="submit" className={buttonClass("primary", "sm")}>Add zone</button>
          </form>
        </section>

        {/* ---------------- Password ---------------- */}
        <form action={changeOwnerPassword} className="card space-y-4 p-6" id="password">
          <h2 className="font-display text-3xl text-white">Owner password</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Current</label><input name="current" type="password" className="input" required autoComplete="current-password" /></div>
            <div><label className="label">New</label><input name="password" type="password" className="input" required minLength={8} autoComplete="new-password" /></div>
            <div><label className="label">Confirm new</label><input name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" /></div>
          </div>
          <Button type="submit" variant="secondary">Change password</Button>
        </form>
      </div>
    </>
  );
}

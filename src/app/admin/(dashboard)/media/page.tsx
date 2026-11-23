import { deleteMedia, setBrandImage, uploadMedia } from "@/app/admin/actions";
import { BrandImage } from "@/components/BrandImage";
import { Badge, Button, buttonClass } from "@/components/ui";
import { getSettings, listMedia } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  empty: "Please choose a file.",
  size: "File too large — maximum 5 MB.",
  type: "Only JPG, PNG or WEBP images are accepted.",
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ saved, error }, rows, settings] = await Promise.all([searchParams, listMedia(), getSettings()]);

  return (
    <>
      <p className="font-script text-xl text-gold">Photos & content</p>
      <h1 className="font-display text-5xl leading-none text-white">Upload Centre</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/60">
        Upload your logo, food photos, promotional posters and gallery pictures. Files are checked (JPG/PNG/WEBP, max 5 MB),
        stored safely in the database and served from <code>/api/media/&lt;id&gt;</code>.
      </p>

      {saved && <p className="mt-4 rounded-xl border border-brand-teal/40 bg-brand-teal/10 p-3 text-sm">Upload saved.</p>}
      {error && <p className="mt-4 rounded-xl border border-brand-red/40 bg-brand-red/10 p-3 text-sm">{ERRORS[error] ?? "Upload failed."}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <form action={uploadMedia} encType="multipart/form-data" className="card space-y-4 p-6">
            <h2 className="font-display text-2xl text-white">Upload a file</h2>
            <div>
              <label className="label" htmlFor="kind">What is it?</label>
              <select id="kind" name="kind" className="input" defaultValue="product">
                <option value="product">Product photo</option>
                <option value="logo">Official logo (replaces the current logo everywhere)</option>
                <option value="hero">Homepage hero image</option>
                <option value="promotion">Promotional poster</option>
                <option value="gallery">Gallery photo (published immediately)</option>
                <option value="menu">Menu document / poster</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="file">File</label>
              <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="input file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-3 file:py-1 file:text-xs file:font-bold file:text-ink" />
            </div>
            <div>
              <label className="label" htmlFor="caption">Caption (gallery only)</label>
              <input id="caption" name="caption" className="input" maxLength={140} />
            </div>
            <Button type="submit" className="w-full">Upload</Button>
          </form>

          <section className="card p-6">
            <h2 className="font-display text-2xl text-white">Current brand images</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">Logo</p>
                <BrandImage src={settings.logoUrl ?? "/assets/logo/danko-mkholwa-logo.png"} alt="Logo" label="Logo" className="mt-1 aspect-square rounded-xl bg-ink" imgClassName="object-contain p-2" />
                {settings.logoUrl && (
                  <form action={setBrandImage} className="mt-2">
                    <input type="hidden" name="target" value="logo" />
                    <button type="submit" className="text-xs text-white/50 hover:text-white">Use file logo instead</button>
                  </form>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">Hero image</p>
                <BrandImage src={settings.heroImageUrl} alt="Hero" label="Hero" className="mt-1 aspect-square rounded-xl" />
                {settings.heroImageUrl && (
                  <form action={setBrandImage} className="mt-2">
                    <input type="hidden" name="target" value="hero" />
                    <button type="submit" className="text-xs text-white/50 hover:text-white">Clear (use promo photo)</button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </aside>

        <section>
          <h2 className="font-display text-2xl text-white">Library ({rows.length})</h2>
          {rows.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">Nothing uploaded yet.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {rows.map((m) => {
                const url = `/api/media/${m.id}`;
                return (
                  <li key={m.id} className="card overflow-hidden">
                    <BrandImage src={url} alt={m.filename} className="aspect-square w-full bg-ink" imgClassName="object-contain" />
                    <div className="space-y-2 p-3 text-xs">
                      <p className="truncate font-semibold text-white" title={m.filename}>#{m.id} · {m.filename}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="muted">{m.kind}</Badge>
                        <span className="text-white/40">{Math.round(m.sizeBytes / 1024)} KB</span>
                      </div>
                      <input readOnly value={url} className="input !py-1 text-[11px]" onFocus={undefined} />
                      <div className="flex flex-wrap gap-1.5">
                        <form action={setBrandImage}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="target" value="logo" />
                          <button type="submit" className={buttonClass("ghost", "sm", "border border-white/15 !px-2.5 !py-1")}>Set as logo</button>
                        </form>
                        <form action={setBrandImage}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="target" value="hero" />
                          <button type="submit" className={buttonClass("ghost", "sm", "border border-white/15 !px-2.5 !py-1")}>Set as hero</button>
                        </form>
                        <form action={deleteMedia}>
                          <input type="hidden" name="id" value={m.id} />
                          <button type="submit" className={buttonClass("danger", "sm", "!px-2.5 !py-1")}>Delete</button>
                        </form>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

import type { Extra, VariationGroup } from "@/db/schema";

// ---- Brand asset locations ------------------------------------------
// Drop the real files here (public/ is served from the website root).
export const ASSETS = {
  logo: "/assets/logo/danko-mkholwa-logo.png",
  promoPoster: "/assets/promotions/double-cheeseburger-poster.jpg",
  menuPoster: "/assets/promotions/menu-poster.jpg",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

// ---- Money ----------------------------------------------------------
/** 6000 -> "R60", 6250 -> "R62.50" */
export function formatZAR(cents: number): string {
  const rands = cents / 100;
  const whole = Number.isInteger(rands);
  return `R${whole ? rands.toString() : rands.toFixed(2)}`;
}

/** "60", "R60", "62,50", "+15" -> cents. Returns null when not a number. */
export function parseRandsToCents(input: string | null | undefined): number | null {
  if (input == null) return null;
  const cleaned = input.replace(/[Rr\s+]/g, "").replace(",", ".");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

// ---- Text helpers ---------------------------------------------------
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalisePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

/** Accepts 0767124232, 076 712 4232, +27767124232, 27767124232 */
export function isValidSouthAfricanPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return true;
  if (digits.length === 11 && digits.startsWith("27")) return true;
  return false;
}

export function formatDateTimeZA(date: Date): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

// ---- Variations & extras (owner edits them as plain text) -----------
// Variations, one group per line:   Size: Regular = 0, Large = 15
// Extras, one per line:             Extra cheese = 10
export function parseVariationsText(text: string): VariationGroup[] {
  const groups: VariationGroup[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const name = line.slice(0, colon).trim();
    const options = line
      .slice(colon + 1)
      .split(",")
      .map((part) => {
        const [label, price] = part.split("=").map((s) => s.trim());
        if (!label) return null;
        return { label, priceDeltaCents: parseRandsToCents(price) ?? 0 };
      })
      .filter((o): o is { label: string; priceDeltaCents: number } => o !== null);
    if (name && options.length > 0) groups.push({ name, options });
  }
  return groups;
}

export function serialiseVariations(groups: VariationGroup[]): string {
  return groups
    .map(
      (g) =>
        `${g.name}: ${g.options
          .map((o) => `${o.label} = ${o.priceDeltaCents / 100}`)
          .join(", ")}`,
    )
    .join("\n");
}

export function parseExtrasText(text: string): Extra[] {
  const extras: Extra[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const [label, price] = line.split("=").map((s) => s.trim());
    if (!label) continue;
    extras.push({ label, priceCents: parseRandsToCents(price) ?? 0 });
  }
  return extras;
}

export function serialiseExtras(extras: Extra[]): string {
  return extras.map((e) => `${e.label} = ${e.priceCents / 100}`).join("\n");
}

// ---- Image validation for uploads -----------------------------------
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/** Checks the first bytes ("magic numbers") so renamed files are rejected. */
export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

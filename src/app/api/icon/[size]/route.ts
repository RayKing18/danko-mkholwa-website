import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getMediaById, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ALLOWED_SIZES = new Set([48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]);

/**
 * Produces a square PNG icon (logo centred on brand black) for the PWA
 * home screen, favicon and Apple touch icon. Source priority:
 *   1. logo uploaded in the owner dashboard (settings.logoUrl → /api/media/:id)
 *   2. public/assets/logo/danko-mkholwa-logo.png
 */
async function loadLogoBytes(): Promise<Buffer | null> {
  try {
    const settings = await getSettings();
    const match = settings.logoUrl?.match(/^\/api\/media\/(\d+)$/);
    if (match) {
      const row = await getMediaById(Number(match[1]));
      if (row) return Buffer.from(row.dataBase64, "base64");
    }
  } catch {
    /* fall through to the static file */
  }
  try {
    return await readFile(
      path.join(process.cwd(), "public", "assets", "logo", "danko-mkholwa-logo.png"),
    );
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size: raw } = await params;
  const size = Number(raw);
  if (!ALLOWED_SIZES.has(size)) return new NextResponse("Not found", { status: 404 });

  const logo = await loadLogoBytes();
  const padding = Math.round(size * 0.1);
  const inner = size - padding * 2;

  let png: Buffer;
  try {
    if (logo) {
      const resized = await sharp(logo)
        .resize(inner, inner, { fit: "inside", withoutEnlargement: false })
        .png()
        .toBuffer();
      png = await sharp({
        create: { width: size, height: size, channels: 4, background: "#0b0b0b" },
      })
        .composite([{ input: resized, gravity: "centre" }])
        .png()
        .toBuffer();
    } else {
      // No logo file yet: plain brand-black tile with a gold ring so the icon is never broken
      const ring = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="#0b0b0b"/><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.36}" fill="none" stroke="#f3b400" stroke-width="${Math.max(2, size * 0.06)}"/></svg>`,
      );
      png = await sharp(ring).png().toBuffer();
    }
  } catch {
    return new NextResponse("Icon error", { status: 500 });
  }

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

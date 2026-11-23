import { NextResponse } from "next/server";
import { getMediaById } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Serves an uploaded image straight from the database. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mediaId = Number(id);
  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const row = await getMediaById(mediaId);
  if (!row) return new NextResponse("Not found", { status: 404 });

  const bytes = Buffer.from(row.dataBase64, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.mimeType,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${row.filename.replace(/"/g, "")}"`,
    },
  });
}

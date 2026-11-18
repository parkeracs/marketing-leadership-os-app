import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { VAULT_DIR } from "@/lib/vault";

const TYPES: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

/**
 * Serves files from attachments/. Locally it reads the vault folder.
 * In production (phase 2) this will redirect to a short-lived Supabase signed URL instead.
 */
export function GET(req: NextRequest) {
  const rel = req.nextUrl.searchParams.get("path") ?? "";
  const full = path.resolve(VAULT_DIR, rel);
  // attachments/ is private and git-ignored; case-studies/images/ holds public screenshots and logos, committed to git.
  const roots = ["attachments", path.join("case-studies", "images")].map((r) => path.resolve(VAULT_DIR, r) + path.sep);
  if (!roots.some((r) => full.startsWith(r)) || !fs.existsSync(full)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const ext = path.extname(full).toLowerCase();
  return new NextResponse(fs.readFileSync(full), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${path.basename(full)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

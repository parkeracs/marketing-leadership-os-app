import { NextResponse } from "next/server";
import { allDocs, COLLECTIONS, asList, unlink } from "@/lib/vault";
import { plainText } from "@/lib/markdown";

export const dynamic = "force-static";

export function GET() {
  const entries = allDocs().map((d) => ({
    id: `${d.collection}/${d.slug}`,
    href: `/${d.collection}/${d.slug}`,
    title: d.title,
    kind: COLLECTIONS[d.collection].singular,
    tags: [
      ...asList(d.data.tags),
      ...asList(d.data.techniques),
      ...asList(d.data.categories),
      unlink(d.data.author),
      String(d.data.company ?? ""),
      String(d.data.brand ?? ""),
    ].join(" "),
    text: plainText(d.body.replace(/^#\s.*$/m, "")),
  }));
  return NextResponse.json(entries);
}

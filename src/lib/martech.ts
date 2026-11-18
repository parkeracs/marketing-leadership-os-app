import { Doc, asList, docsIn, unlink } from "@/lib/vault";
import { plainText } from "@/lib/markdown";

/** Category guides keyed by their `slug` frontmatter (the value vendor notes use in `categories`). */
export function categoryGuides(): Map<string, Doc> {
  const map = new Map<string, Doc>();
  for (const g of docsIn("martech-categories")) {
    const slug = String(g.data.slug ?? "");
    if (slug) map.set(slug, g);
  }
  return map;
}

export function vendors(): Doc[] {
  return docsIn("martech").sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
}

export function vendorsIn(slug: string): Doc[] {
  return vendors().filter((v) => asList(v.data.categories).includes(slug));
}

/** The one-line description under the vendor's heading. */
export function whatItDoes(doc: Doc): string {
  const body = doc.body.replace(/^#\s.*$/m, "");
  const line = body.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith(">") && !l.startsWith("#"));
  return line ? plainText(line) : "";
}

export type Evidence = "mine" | "recommended" | "sponsor" | "web" | "mentioned";

/** The strongest reason a vendor is on the list, in the order /advise trusts it. */
export function evidence(doc: Doc): { kind: Evidence; label: string } {
  const status = String(doc.data.status ?? "");
  const rec = asList(doc.data.recommended_by).map(unlink);
  const sponsor = asList(doc.data.sponsor_of).map(unlink);
  if (status === "used" || status === "trialled") return { kind: "mine", label: status === "used" ? "I've used it" : "I've trialled it" };
  if (rec.length) return { kind: "recommended", label: `Recommended by ${listNames(rec)}` };
  if (doc.data.origin === "sponsor" || sponsor.length) return { kind: "sponsor", label: sponsor.length ? `Sponsor of ${listNames(sponsor)}` : "Sponsor or feature only" };
  if (doc.data.origin === "web") return { kind: "web", label: "Outside my trusted sources" };
  return { kind: "mentioned", label: "Mentioned by trusted sources" };
}

function listNames(names: string[]): string {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
}

export const STATUS_LABEL: Record<string, string> = {
  "to-explore": "To explore",
  trialled: "Trialled",
  used: "Used",
  "ruled-out": "Ruled out",
};

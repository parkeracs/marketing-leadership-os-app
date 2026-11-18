import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Demo mode: public deployment, no login. It may only ever render demo content. */
export const DEMO_MODE = process.env.DEMO_MODE === "true";

/** The file that marks a content folder as safe to publish. The private vault never has one. */
export const DEMO_MARKER = ".demo-content";

/**
 * Where the vault lives. Locally: the sibling folder. On Vercel: cloned at build time.
 * Demo mode has no fallback: VAULT_DIR must be set, so it can never default to the private vault.
 */
export const VAULT_DIR = resolveVaultDir();

function resolveVaultDir(): string {
  if (process.env.VAULT_DIR) return path.resolve(process.env.VAULT_DIR);
  if (DEMO_MODE) {
    throw new Error("[vault] DEMO_MODE is on but VAULT_DIR is not set. Point it at the demo content folder.");
  }
  return path.resolve(process.cwd(), "../marketing-os");
}

/** Fail closed: in demo mode, refuse to read any folder that isn't marked as demo content. */
function assertDemoContent(): void {
  if (!DEMO_MODE) return;
  if (!fs.existsSync(path.join(VAULT_DIR, DEMO_MARKER))) {
    throw new Error(
      `[vault] DEMO_MODE is on but ${VAULT_DIR} has no ${DEMO_MARKER} marker. ` +
        "Refusing to build: only folders marked as demo content can be published.",
    );
  }
}

export const COLLECTIONS = {
  playbooks: { folder: "playbooks", label: "Playbooks", singular: "Playbook" },
  library: { folder: "library", label: "Library", singular: "Library note" },
  "case-studies": { folder: "case-studies", label: "Case studies", singular: "Case study" },
  swipe: { folder: "swipe", label: "Swipe file", singular: "Swipe" },
  martech: { folder: "martech", label: "Martech", singular: "Vendor" },
  "martech-categories": { folder: "martech/categories", label: "Martech categories", singular: "Category guide" },
  canon: { folder: "canon", label: "Trusted sources", singular: "Source" },
  principles: { folder: "principles", label: "Principles", singular: "Principle" },
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;
export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as CollectionKey[];
/** Collections shown in the navigation. Category guides are reached from Martech. */
export const NAV_KEYS = COLLECTION_KEYS.filter((k) => k !== "martech-categories");

export type Doc = {
  collection: CollectionKey;
  slug: string;
  name: string; // file basename without .md (what wikilinks point at)
  title: string;
  data: Record<string, unknown>;
  body: string;
};

export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstHeading(body: string): string | undefined {
  const m = body.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim();
}

let cache: Doc[] | null = null;

/** Every content doc in the vault, excluding folder indexes. */
export function allDocs(): Doc[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  assertDemoContent();
  const docs: Doc[] = [];
  for (const key of COLLECTION_KEYS) {
    const dir = path.join(VAULT_DIR, COLLECTIONS[key].folder);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md") || file.startsWith("_")) continue;
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const name = file.replace(/\.md$/, "");
      docs.push({
        collection: key,
        slug: slugify(name),
        name,
        title: String(data.title ?? firstHeading(content) ?? name),
        data: normaliseData(data),
        body: content,
      });
    }
  }
  cache = docs;
  return docs;
}

/** gray-matter turns YAML dates into Date objects; keep everything as plain strings. */
function normaliseData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v instanceof Date) out[k] = v.toISOString().slice(0, 10);
    else out[k] = v;
  }
  return out;
}

export function docsIn(collection: CollectionKey): Doc[] {
  return allDocs().filter((d) => d.collection === collection);
}

export function getDoc(collection: CollectionKey, slug: string): Doc | undefined {
  return allDocs().find((d) => d.collection === collection && d.slug === slug);
}

/** Resolve an Obsidian wikilink target (basename or path) to an app route. */
export function resolveLink(target: string): string | null {
  const clean = target.split("#")[0].replace(/\.md$/, "").trim();
  if (!clean) return null;
  if (clean.startsWith("attachments/") || clean.startsWith("case-studies/images/")) return `/api/asset?path=${encodeURIComponent(clean)}`;
  const base = clean.split("/").pop()!.toLowerCase();
  if (base === "_index") {
    const folder = clean.split("/")[0];
    const key = COLLECTION_KEYS.find((k) => COLLECTIONS[k].folder === folder);
    return key ? `/${key}` : null;
  }
  const doc = allDocs().find((d) => d.name.toLowerCase() === base);
  return doc ? `/${doc.collection}/${doc.slug}` : null;
}

/** Strip wikilink brackets from a frontmatter value like "[[Dave Kellogg]]". */
export function unlink(v: unknown): string {
  if (Array.isArray(v)) return v.map(unlink).join(", ");
  if (v == null) return "";
  return String(v).replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_m, a, _b, alias) => alias ?? a.split("/").pop());
}

export function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (v == null || v === "") return [];
  return [String(v)];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-12-02" → "2 Dec 2024", "2024-12" → "Dec 2024", "2026-Q1"/"2023" kept, "unknown" → "". */
export function formatDate(v: unknown): string {
  const s = String(v ?? "").trim();
  if (!s || s === "unknown") return "";
  // Periods like "2025-09 to present" or "2024-03–2025-01": format each date inside.
  if (/\d{4}-\d{2}.*\s|–/.test(s) && !/^\d{4}-\d{2}(-\d{2})?$/.test(s)) {
    return s.replace(/\b(\d{4})-(\d{2})(?:-(\d{2}))?\b/g, (_m, y, mo, d) => (d ? `${Number(d)} ` : "") + `${MONTHS[Number(mo) - 1]} ${y}`);
  }
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  m = s.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  return s;
}

/** Where the original lives: a URL, or a private file in attachments/. */
export function sourceInfo(doc: Doc): { href: string; label: string; host: string } | null {
  const raw = String(doc.data.source ?? doc.data.source_url ?? doc.data.website ?? "").trim();
  if (!raw) return null;
  const file = raw.match(/\[\[([^\]]+)\]\]/)?.[1];
  if (file) {
    const href = resolveLink(file);
    if (!href) return null;
    const ext = file.split(".").pop()?.toUpperCase() ?? "file";
    return { href, label: `Open the ${ext === "PDF" ? "PDF" : ext + " file"}`, host: "Private copy" };
  }
  if (/^https?:\/\//.test(raw)) {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    const label = doc.collection === "swipe" ? "See the original" : doc.collection === "martech" ? "Visit the website" : "Read the original";
    return { href: raw, label, host };
  }
  return null;
}

/** "Mark Roberge on Topline", "Dave Kellogg", "Insight Partners". */
export function byline(doc: Doc): { who: string; publication: string | null; publicationHref: string | null } {
  const author = unlink(doc.data.author);
  const contributor = String(doc.data.contributor ?? "").split(/[(,]/)[0].trim();
  const authorTarget = String(Array.isArray(doc.data.author) ? doc.data.author[0] : doc.data.author ?? "").match(/\[\[([^\]|]+)/)?.[1];
  const href = authorTarget ? resolveLink(authorTarget) : null;
  if (contributor && contributor !== author) return { who: contributor, publication: author || null, publicationHref: href };
  return { who: author, publication: null, publicationHref: href };
}

export type LinkKey = "website" | "newsletter" | "linkedin" | "x" | "youtube" | "podcast";
export function profileLinks(doc: Doc): { key: LinkKey; href: string }[] {
  const links = (doc.data.links ?? {}) as Record<string, string>;
  const order: LinkKey[] = ["website", "newsletter", "podcast", "youtube", "linkedin", "x"];
  return order.filter((k) => typeof links[k] === "string" && links[k]).map((k) => ({ key: k, href: links[k] }));
}

export type PersonLinks = { name: string; links: { key: LinkKey; href: string }[] };
/** Case study builders and where to follow them, from `people` and `people_links`. */
export function peopleWithLinks(doc: Doc): PersonLinks[] {
  const map = (doc.data.people_links ?? {}) as Record<string, Record<string, string>>;
  const names = asList(doc.data.people).map((p) => p.split("(")[0].trim());
  for (const n of Object.keys(map)) if (!names.includes(n)) names.push(n);
  const order: LinkKey[] = ["website", "newsletter", "linkedin", "x"];
  return names.map((name) => ({
    name,
    links: order.filter((k) => map[name]?.[k]).map((k) => ({ key: k, href: map[name][k] })),
  }));
}

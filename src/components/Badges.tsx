/** Freshness as a quiet dot + word. Pine = current, Brass = aging, Clay = expired, faint = superseded. */
export function Freshness({ value }: { value?: unknown }) {
  const v = String(value ?? "");
  if (!v) return null;
  return <span className={`fresh ${v}`}>{v === "current" ? "Current" : v === "aging" ? "Aging" : v[0].toUpperCase() + v.slice(1)}</span>;
}

const SPECIAL: Record<string, string> = { ai: "AI", revops: "RevOps", plg: "PLG", b2b: "B2B", b2c: "B2C", ooh: "Out-of-home", "product-ui": "Product UI", seo: "SEO" };
const sentence = (s: string) => SPECIAL[s] ?? (s ? s[0].toUpperCase() + s.slice(1) : s).replace(/-/g, " ");

/** Tags as plain text: "Leadership · Measurement". */
export function TagLine({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return <span>{tags.map(sentence).join(" · ")}</span>;
}

export { sentence };

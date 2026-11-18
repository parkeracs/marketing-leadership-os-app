import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  COLLECTIONS, COLLECTION_KEYS, CollectionKey, Doc, asList, byline, docsIn, formatDate, profileLinks, resolveLink, sourceInfo, unlink,
} from "@/lib/vault";
import { plainText } from "@/lib/markdown";
import { LibraryBrowser, LibItem } from "@/components/LibraryBrowser";
import { SwipeBrowser, SwipeItem } from "@/components/SwipeBrowser";
import { ProfileLinks } from "@/components/ProfileLinks";
import { PlaybookCards, caseSummary, jobLine, tacticTitle } from "@/components/Cards";
import { CaseStudyBrowser } from "@/components/CaseStudyBrowser";
import { MartechBrowser, VendorItem, CategoryItem } from "@/components/MartechBrowser";
import { categoryGuides, evidence, vendors, vendorsIn, whatItDoes } from "@/lib/martech";

type Params = { collection: string };

export function generateStaticParams(): Params[] {
  return COLLECTION_KEYS.map((collection) => ({ collection }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { collection } = await params;
  return { title: COLLECTIONS[collection as CollectionKey]?.label ?? "Not found" };
}

const LEDES: Record<CollectionKey, string> = {
  playbooks: "How to do the job, in your situation: what changes the answer, the process, the resources and the moves that work.",
  library: "What trusted sources said, dated and linked to the original. Principles stay; specifics expire.",
  "case-studies": "Who did it brilliantly, and exactly how. Researched from the open web and fully cited.",
  swipe: "What great looks like, saved as I come across it and sorted by format and technique.",
  martech: "Tools worth exploring, filed by the job they do. Each one is here for a reason: a trusted source recommends it or shows it working, it sponsors a newsletter or podcast I trust, or I picked it.",
  "martech-categories": "One guide per job a tool can do: what it's for, and what the trusted sources say about the vendors.",
  canon: "The people and publications whose thinking I trust, and what I go to them for.",
  principles: "My own point of view. Drafts until I've confirmed them.",
};

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { collection } = await params;
  if (!COLLECTION_KEYS.includes(collection as CollectionKey)) notFound();
  const key = collection as CollectionKey;
  const docs = docsIn(key);

  return (
    <>
      <h1 className="page-title">{COLLECTIONS[key].label}</h1>
      <p className="lede">
        {key === "principles" && docs.length === 0 ? "Your own point of view on marketing leadership, in your own words." : LEDES[key]}
      </p>
      {key === "playbooks" && <Playbooks docs={docs} />}
      {key === "library" && <LibraryBrowser items={libraryItems(docs)} />}
      {key === "case-studies" && <CaseStudyBrowser items={caseItems(docs)} />}
      {key === "swipe" && <SwipeBrowser items={swipeItems(docs)} />}
      {key === "martech" && <MartechBrowser items={vendorItems()} categories={categoryItems()} />}
      {key === "martech-categories" && <CategoryRows />}
      {key === "canon" && <Canon docs={docs} />}
      {key === "principles" && <Principles docs={docs} />}
    </>
  );
}

function Playbooks({ docs }: { docs: Doc[] }) {
  const hubs = docs.filter((d) => !d.data.parent);
  const childCount = (h: Doc) => docs.filter((d) => unlink(d.data.parent) === h.name).length;
  const sorted = [...hubs].sort((a, b) => a.title.localeCompare(b.title));
  return <PlaybookCards docs={docs} hubs={sorted} />;
}

function Canon({ docs }: { docs: Doc[] }) {
  return (
    <div className="rows">
      {docs.map((d) => {
        const desc = String(d.data.description ?? "") || cleanLens(d.body.match(/\*\*Lens:\*\*\s*([^\n]+)/)?.[1] ?? "");
        return (
          <div key={d.slug} className="row" style={{ gridTemplateColumns: "1fr" }}>
            <span className="t">
              <Link href={`/canon/${d.slug}`}>{d.title}</Link>
            </span>
            {desc && <span className="by" style={{ color: "var(--ink-muted)" }}>{desc}</span>}
            <ProfileLinks links={profileLinks(d)} />
          </div>
        );
      })}
    </div>
  );
}

function cleanLens(raw: string): string {
  const t = plainText(raw).replace(/\s*See [^.]+\.?\s*$/, "").trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function Principles({ docs }: { docs: Doc[] }) {
  if (docs.length === 0) {
    return (
      <div className="empty-state">
        <p>When you state a view in a session, Claude drafts it here; it only counts once you confirm it.</p>
        <p className="faint">
          <em>Empty in the demo on purpose: principles are personal, and sample ones would put words in someone&rsquo;s mouth.</em>
        </p>
      </div>
    );
  }
  return (
    <div className="rows">
      {docs.map((d) => (
        <Link key={d.slug} href={`/principles/${d.slug}`} className="row" style={{ color: "inherit" }}>
          <span className="t">{d.title}</span>
          <span className="side faint" style={{ fontSize: 13.5 }}>{d.data.status === "held" ? "Held" : "Draft"}</span>
          <span className="by" style={{ color: "var(--ink-muted)" }}>{jobLine(d, 150)}</span>
        </Link>
      ))}
    </div>
  );
}

function libraryItems(docs: Doc[]): LibItem[] {
  return docs
    .map((d) => {
      const b = byline(d);
      return {
        href: `/library/${d.slug}`,
        title: d.title,
        who: b.who,
        publication: b.publication,
        date: formatDate(d.data.published),
        tags: asList(d.data.tags),
        freshness: String(d.data.freshness ?? ""),
        origin: String(d.data.origin ?? ""),
        sort: String(d.data.clipped ?? ""),
        source: sourceInfo(d),
        corporate: d.data.corporate_data === true,
      };
    })
    .sort((a, b) => b.sort.localeCompare(a.sort) || a.title.localeCompare(b.title));
}

function swipeItems(docs: Doc[]): SwipeItem[] {
  return docs.map((d) => {
    const img = String(d.data.image ?? "").match(/\[\[([^\]]+)\]\]/)?.[1];
    const why = d.body.match(/## Why it works\s+([\s\S]*?)(\n## |$)/)?.[1] ?? "";
    const firstWhy = plainText(why).slice(0, 160).replace(/\s\S*$/, "") + "…";
    return {
      href: `/swipe/${d.slug}`,
      brand: String(d.data.brand ?? ""),
      title: d.title,
      format: String(d.data.format ?? ""),
      audience: String(d.data.audience ?? ""),
      techniques: asList(d.data.techniques),
      image: img ? resolveLink(img) : null,
      why: firstWhy,
    };
  });
}

function caseItems(docs: Doc[]) {
  return docs.map((d) => ({
    slug: d.slug,
    company: String(d.data.company ?? ""),
    title: tacticTitle(d),
    summary: caseSummary(d),
    meta: [String(d.data.period ?? ""), asList(d.data.people).map((p) => p.split("(")[0].trim()).join(", ")].filter(Boolean).join(" · "),
    tags: asList(d.data.tags),
    tactic: String(d.data.tactic ?? ""),
  }));
}

function categoryItems(): CategoryItem[] {
  return [...categoryGuides().entries()]
    .map(([slug, g]) => ({ slug, title: g.title, href: `/martech-categories/${g.slug}`, count: vendorsIn(slug).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function vendorItems(): VendorItem[] {
  const guides = categoryGuides();
  return vendors().map((d) => ({
    href: `/martech/${d.slug}`,
    name: d.title,
    what: whatItDoes(d),
    categories: asList(d.data.categories).map((slug) => ({ slug, title: guides.get(slug)?.title ?? slug })),
    evidence: evidence(d),
    freshness: String(d.data.freshness ?? ""),
  }));
}

function CategoryRows() {
  return (
    <div className="rows">
      {categoryItems().map((c) => (
        <Link key={c.slug} href={c.href} className="row" style={{ color: "inherit" }}>
          <span className="t">{c.title}</span>
          <span className="side faint" style={{ fontSize: 13.5 }}>{c.count} vendors</span>
        </Link>
      ))}
    </div>
  );
}

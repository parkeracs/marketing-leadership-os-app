import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  COLLECTIONS, COLLECTION_KEYS, CollectionKey, allDocs, asList, byline, docsIn, formatDate, getDoc, peopleWithLinks, profileLinks, resolveLink,
  sourceInfo, unlink,
} from "@/lib/vault";
import { renderMarkdown } from "@/lib/markdown";
import { Freshness, TagLine, sentence } from "@/components/Badges";
import { Icon } from "@/components/Icons";
import { ProfileLinks } from "@/components/ProfileLinks";
import { tacticTitle } from "@/components/Cards";
import { BackLink } from "@/components/ReadingTrail";
import { STATUS_LABEL, categoryGuides, evidence, vendorsIn, whatItDoes } from "@/lib/martech";

type Params = { collection: string; slug: string };

export function generateStaticParams(): Params[] {
  return allDocs().map((d) => ({ collection: d.collection, slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { collection, slug } = await params;
  const doc = COLLECTION_KEYS.includes(collection as CollectionKey) ? getDoc(collection as CollectionKey, slug) : undefined;
  return { title: doc?.title ?? "Not found" };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { collection, slug } = await params;
  if (!COLLECTION_KEYS.includes(collection as CollectionKey)) notFound();
  const key = collection as CollectionKey;
  const doc = getDoc(key, slug);
  if (!doc) notFound();

  const d = doc.data;
  const builders = key === "case-studies" ? peopleWithLinks(doc) : [];
  // Martech notes open with their own "# Title"; the page header already shows it.
  const body = key === "martech" || key === "martech-categories" ? doc.body.replace(/^\s*#\s.*\n/, "") : doc.body;
  const html = await renderMarkdown(body, {
    citations: key === "case-studies",
    personLinks: builders,
    // Blind spots stay in the vault for /advise, but aren't shown in the app.
    hideSections:
      key === "canon"
        ? [/^\*\*Blind spots?[^*]*:\*\*[^\n]*\n?/gm]
        : key === "martech-categories"
          ? [/^## [^\n]+\n+_To build:[^\n]*_\n*/gm] // unwritten guide sections stay in the vault only
          : [],
  });
  const logo = typeof d.logo === "string" ? resolveLink(d.logo) : null;
  const src = sourceInfo(doc);
  const b = byline(doc);

  // Playbook family: the hub and its children
  const parentName = d.parent ? unlink(d.parent) : null;
  const hubName = parentName ?? (key === "playbooks" ? doc.name : null);
  const family =
    key === "playbooks" && hubName
      ? docsIn("playbooks")
          .filter((p) => p.name === hubName || unlink(p.data.parent) === hubName)
          .sort((a, b2) => (a.name === hubName ? -1 : b2.name === hubName ? 1 : a.title.localeCompare(b2.title)))
      : [];
  const hub = family.find((f) => f.name === hubName);

  const back =
    parentName && hub
      ? { href: `/playbooks/${hub.slug}`, label: hub.title }
      : key === "martech-categories"
        ? { href: "/martech", label: "Martech" }
        : { href: `/${key}`, label: COLLECTIONS[key].label };
  const guides = key === "martech" ? categoryGuides() : null;
  const ev = key === "martech" ? evidence(doc) : null;
  const catVendors = key === "martech-categories" ? vendorsIn(String(d.slug ?? "")) : [];
  const date = formatDate(d.published);
  const tags = [...asList(d.tags), ...asList(d.techniques)];

  return (
    <article>
      <BackLink fallback={back} />

      <header className="doc-head">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element -- served by the authenticated asset route
          <img className="case-logo" src={logo} alt={`${String(d.company ?? "")} logo`} />
        )}
        <h1 className="page-title">{doc.title}</h1>

        {key === "library" && (
          <p className="byline">
            {b.publicationHref && !b.publication ? <Link href={b.publicationHref}>{b.who}</Link> : <span>{b.who}</span>}
            {b.publication && (
              <span className="muted">
                &nbsp;on {b.publicationHref ? <Link href={b.publicationHref}>{b.publication}</Link> : b.publication}
              </span>
            )}
            {date && (<><span className="sep">·</span><span className="muted">{date}</span></>)}
            {!date && <><span className="sep">·</span><span className="muted">Date unknown</span></>}
          </p>
        )}

        {key === "case-studies" && (
          <>
            {d.period ? <p className="byline"><span className="muted">{formatDate(d.period)}</span></p> : null}
          </>
        )}

        {key === "swipe" && (
          <p className="byline">
            <span>{String(d.brand ?? "")}</span>
            <span className="sep">·</span>
            <span className="muted">{sentence(String(d.format ?? ""))}</span>
          </p>
        )}

        {key === "canon" && <ProfileLinks links={profileLinks(doc)} />}

        {key === "martech" && guides && (
          <p className="byline">
            {asList(d.categories).map((c, n) => {
              const g = guides.get(c);
              return (
                <span key={c}>
                  {n > 0 && <span className="sep">·</span>}
                  {g ? <Link href={`/martech-categories/${g.slug}`}>{g.title}</Link> : c}
                </span>
              );
            })}
            <span className="sep">·</span>
            <span className="muted">{STATUS_LABEL[String(d.status ?? "")] ?? String(d.status ?? "")}</span>
          </p>
        )}

        {key === "martech-categories" && (
          <p className="byline">
            <span className="muted">{catVendors.length} vendors</span>
            {d.guide_status === "stub" && (<><span className="sep">·</span><span className="muted">Guide still being built</span></>)}
          </p>
        )}

        {src && (
          <div className="source-cta">
            <a className="button" href={src.href} target={src.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {src.label} <Icon name="external" size={15} />
            </a>
            <span className="host">{src.host}</span>
          </div>
        )}

        {(tags.length > 0 || Boolean(d.freshness)) && (
          <div className="doc-sub">
            {tags.length > 0 && <TagLine tags={tags} />}
            <Freshness value={d.freshness} />
            {d.review_by ? <span>Review by {formatDate(d.review_by)}</span> : null}
            {d.origin === "research" && <span>Researched, not clipped</span>}
            {key === "library" && d.tier === "web" && <span>Outside my trusted sources</span>}
            {ev && <span className={`evidence ${ev.kind}`}>{ev.label}</span>}
            {key === "library" && d.corporate_data === true && (
              <span className="corp-badge" title="A big-company study, used where no start-up equivalent exists">Corporate data</span>
            )}
            {d.origin === "web-research" && <span>Web research, outside my trusted sources</span>}
          </div>
        )}
      </header>

      {key === "playbooks" && (
        <p className="source-key">
          Citations: <span className="solid">trusted sources</span> · <span className="dotted">outside my trusted sources</span>
        </p>
      )}

      <div className={family.length > 1 ? "doc-layout" : ""}>
        <div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          {key === "martech-categories" && (
            <div className="rows">
              {catVendors.map((v) => {
                const e = evidence(v);
                return (
                  <div key={v.slug} className="row">
                    <span className="t"><Link href={`/martech/${v.slug}`}>{v.title}</Link></span>
                    <span className="by" style={{ color: "var(--ink-muted)" }}>{whatItDoes(v)}</span>
                    <span className="side"><span className={`evidence ${e.kind}`}>{e.label}</span></span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {family.length > 1 && (
          <aside className="doc-aside">
            <h2>In this playbook</h2>
            {family.map((f) => (
              <Link key={f.slug} href={`/playbooks/${f.slug}`} className={f.slug === doc.slug ? "current" : ""}>
                {f.name === hubName ? "Overview" : tacticTitle(f)}
              </Link>
            ))}
          </aside>
        )}
      </div>
    </article>
  );
}

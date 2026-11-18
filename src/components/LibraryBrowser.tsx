"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Freshness, TagLine, sentence } from "./Badges";
import { Icon } from "./Icons";

export type LibItem = {
  href: string;
  title: string;
  who: string;
  publication: string | null;
  date: string;
  tags: string[];
  freshness: string;
  origin: string;
  sort: string;
  source: { href: string; label: string; host: string } | null;
  corporate: boolean;
};

function toggle(set: string[], v: string) {
  return set.includes(v) ? set.filter((x) => x !== v) : [...set, v];
}

export function LibraryBrowser({ items }: { items: LibItem[] }) {
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [currentOnly, setCurrentOnly] = useState(false);

  const allTags = useMemo(() => [...new Set(items.flatMap((i) => i.tags))].sort(), [items]);
  const allSources = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => { const s = i.publication ?? i.who; if (s) counts.set(s, (counts.get(s) ?? 0) + 1); });
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const shown = items.filter((i) => {
    if (q && !(i.title + " " + i.who + " " + (i.publication ?? "")).toLowerCase().includes(q.toLowerCase())) return false;
    if (tags.length && !tags.some((t) => i.tags.includes(t))) return false;
    if (source && (i.publication ?? i.who) !== source) return false;
    if (currentOnly && i.freshness !== "current") return false;
    return true;
  });

  return (
    <>
      <button className="chip filter-toggle" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? "Hide filters" : "Filters"}
      </button>
      <div className={`filters${showFilters ? " open" : ""}`}>
        <input className="text-input" placeholder="Search titles and authors" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="filter-row">
          <span className="label">Source</span>
          <select className="text-input select" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All sources ({allSources.length})</option>
            {allSources.map(([s, n]) => (
              <option key={s} value={s}>{s} ({n})</option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <span className="label">Topic</span>
          {allTags.map((t) => (
            <button key={t} className="chip" aria-pressed={tags.includes(t)} onClick={() => setTags(toggle(tags, t))}>
              {sentence(t)}
            </button>
          ))}
          <button className="chip" aria-pressed={currentOnly} onClick={() => setCurrentOnly(!currentOnly)} style={{ marginLeft: 8 }}>
            Current only
          </button>
        </div>
      </div>
      <p className="count-line">
        {shown.length === items.length ? `${items.length} notes` : `${shown.length} of ${items.length} notes`}
      </p>
      <div className="rows">
        {shown.map((i) => (
          <div key={i.href} className="row">
            <span className="t">
              <Link href={i.href}>{i.title}</Link>
            </span>
            <span className="by">
              {i.who}
              {i.publication && <span className="pub"> on {i.publication}</span>}
              {i.date && <span className="pub"> · {i.date}</span>}
            </span>
            <span className="tags">
              <TagLine tags={i.tags} />
              {i.corporate && <span className="corp-badge">Corporate data</span>}
            </span>
            <span className="side">
              {i.source && (
                <a className="ext" href={i.source.href} target={i.source.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {i.source.href.startsWith("http") ? i.source.host : "PDF"} <Icon name="external" size={13} />
                </a>
              )}
              <Freshness value={i.freshness} />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

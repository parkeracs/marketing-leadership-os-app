"use client";

import Link from "next/link";
import { useState } from "react";
import { Freshness } from "./Badges";

export type VendorItem = {
  href: string;
  name: string;
  what: string;
  categories: { slug: string; title: string }[];
  evidence: { kind: string; label: string };
  freshness: string;
};

export type CategoryItem = { slug: string; title: string; href: string; count: number };

const EVIDENCE: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "recommended", label: "Recommended by trusted sources" },
  { key: "sponsor", label: "Sponsors" },
  { key: "mine", label: "Trialled or used" },
];

export function MartechBrowser({ items, categories }: { items: VendorItem[]; categories: CategoryItem[] }) {
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [ev, setEv] = useState("");

  const shown = items.filter((i) => {
    if (q && !(i.name + " " + i.what).toLowerCase().includes(q.toLowerCase())) return false;
    if (cat && !i.categories.some((c) => c.slug === cat)) return false;
    if (ev && i.evidence.kind !== ev) return false;
    return true;
  });
  const guide = categories.find((c) => c.slug === cat);

  return (
    <>
      <button className="chip filter-toggle" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? "Hide filters" : "Filters"}
      </button>
      <div className={`filters${showFilters ? " open" : ""}`}>
        <input className="text-input" placeholder="Search vendors" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="filter-row">
          <span className="label">Job</span>
          <select className="text-input select" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title} ({c.count})</option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <span className="label">Why listed</span>
          {EVIDENCE.map((e) => (
            <button key={e.key || "all"} className="chip" aria-pressed={ev === e.key} onClick={() => setEv(e.key)}>
              {e.label}
            </button>
          ))}
        </div>
      </div>
      <p className="count-line">
        {shown.length === items.length ? `${items.length} vendors` : `${shown.length} of ${items.length} vendors`}
        {guide && (
          <>
            {" · "}
            <Link href={guide.href}>How to choose: {guide.title}</Link>
          </>
        )}
      </p>
      <div className="rows">
        {shown.map((i) => (
          <div key={i.href} className="row">
            <span className="t">
              <Link href={i.href}>{i.name}</Link>
            </span>
            <span className="by" style={{ color: "var(--ink-muted)" }}>{i.what}</span>
            <span className="tags">
              {i.categories.map((c, n) => (
                <span key={c.slug}>
                  {n > 0 && " · "}
                  <button className="link-button" onClick={() => setCat(c.slug)}>{c.title}</button>
                </span>
              ))}
            </span>
            <span className="side">
              <span className={`evidence ${i.evidence.kind}`}>{i.evidence.label}</span>
              {i.freshness !== "current" && <Freshness value={i.freshness} />}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sentence } from "./Badges";

export type SwipeItem = {
  href: string;
  brand: string;
  title: string;
  format: string;
  audience: string;
  techniques: string[];
  image: string | null;
  why: string;
};

function toggle(set: string[], v: string) {
  return set.includes(v) ? set.filter((x) => x !== v) : [...set, v];
}

export function SwipeBrowser({ items }: { items: SwipeItem[] }) {
  const [showFilters, setShowFilters] = useState(false);
  const [formats, setFormats] = useState<string[]>([]);
  const [techs, setTechs] = useState<string[]>([]);
  const allFormats = useMemo(() => [...new Set(items.map((i) => i.format).filter(Boolean))].sort(), [items]);
  const allTechs = useMemo(() => [...new Set(items.flatMap((i) => i.techniques))].sort(), [items]);

  const shown = items.filter(
    (i) => (!formats.length || formats.includes(i.format)) && (!techs.length || techs.some((t) => i.techniques.includes(t)))
  );

  return (
    <>
      <button className="chip filter-toggle" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? "Hide filters" : "Filters"}
      </button>
      <div className={`filters${showFilters ? " open" : ""}`}>
        <div className="filter-row">
          <span className="label">Format</span>
          {allFormats.map((t) => (
            <button key={t} className="chip" aria-pressed={formats.includes(t)} onClick={() => setFormats(toggle(formats, t))}>
              {sentence(t)}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <span className="label">Technique</span>
          {allTechs.map((t) => (
            <button key={t} className="chip" aria-pressed={techs.includes(t)} onClick={() => setTechs(toggle(techs, t))}>
              {sentence(t)}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="empty">Nothing saved yet with these filters.</p>
      ) : (
        <div className="masonry">
          {shown.map((i) => (
            <Link key={i.href} href={i.href} className="swipe-card">
              {/* eslint-disable-next-line @next/next/no-img-element -- private assets come from an authenticated route */}
              {i.image && <img src={i.image} alt={i.title} loading="lazy" />}
              <div className="body">
                <div className="brand-line">{i.brand}</div>
                <div className="fmt">
                  {sentence(i.format)} · {i.techniques.map(sentence).join(", ")}
                </div>
                <p className="why">{i.why}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

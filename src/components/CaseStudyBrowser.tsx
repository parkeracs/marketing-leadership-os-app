"use client";

import { useMemo, useState } from "react";
import { TagLine, sentence } from "./Badges";
import { XCard } from "./XCard";

export type CaseItem = {
  slug: string;
  company: string;
  title: string;
  summary: string;
  meta: string;
  tags: string[];
  tactic: string;
};

function toggle(set: string[], v: string) {
  return set.includes(v) ? set.filter((x) => x !== v) : [...set, v];
}

/** Case studies filtered by tactic and topic, so the list stays usable as it grows. */
export function CaseStudyBrowser({ items }: { items: CaseItem[] }) {
  const [tactics, setTactics] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const allTactics = useMemo(() => [...new Set(items.map((i) => i.tactic).filter(Boolean))].sort(), [items]);
  const allTags = useMemo(() => [...new Set(items.flatMap((i) => i.tags))].sort(), [items]);

  const shown = items.filter(
    (i) => (!tactics.length || tactics.includes(i.tactic)) && (!tags.length || tags.some((t) => i.tags.includes(t)))
  );

  return (
    <>
      <div className="filters open">
        {allTactics.length > 1 && (
          <div className="filter-row">
            <span className="label">Tactic</span>
            {allTactics.map((t) => (
              <button key={t} className="chip" aria-pressed={tactics.includes(t)} onClick={() => setTactics(toggle(tactics, t))}>
                {sentence(t)}
              </button>
            ))}
          </div>
        )}
        <div className="filter-row">
          <span className="label">Topic</span>
          {allTags.map((t) => (
            <button key={t} className="chip" aria-pressed={tags.includes(t)} onClick={() => setTags(toggle(tags, t))}>
              {sentence(t)}
            </button>
          ))}
        </div>
      </div>
      <p className="count-line">
        {shown.length === items.length ? `${items.length} case studies` : `${shown.length} of ${items.length} case studies`}
      </p>
      <div className="stack">
        {shown.map((d) => (
          <XCard key={d.slug} kicker={d.company} title={d.title} href={`/case-studies/${d.slug}`} openLabel="Read the case study">
            <p>{d.summary}</p>
            <p className="faint" style={{ fontSize: 14 }}>
              {[sentence(d.tactic), <TagLine key="t" tags={d.tags} />, d.meta].filter(Boolean).map((x, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  {x}
                </span>
              ))}
            </p>
          </XCard>
        ))}
      </div>
    </>
  );
}

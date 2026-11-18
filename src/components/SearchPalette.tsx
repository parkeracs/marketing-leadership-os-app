"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";

type Entry = { id: string; href: string; title: string; kind: string; text: string; tags: string };

const OPEN_EVENT = "mos:open-search";
export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const reset = () => {
      setQ("");
      setSel(0);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        reset();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => {
      reset();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Load the index quietly after the page settles, so search is ready when it's opened.
  useEffect(() => {
    const load = () => fetch("/api/search").then((r) => r.json()).then(setEntries);
    const id = window.setTimeout(load, 1500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  const index = useMemo(() => {
    if (!entries) return null;
    const ms = new MiniSearch<Entry>({
      fields: ["title", "tags", "text"],
      storeFields: ["href", "title", "kind", "text"],
      searchOptions: {
        boost: { title: 4, tags: 2 },
        // Prefix-match only the word still being typed, and forgive typos only in longer words,
        // so short terms like "arr" don't pull in "arrive" or "array".
        prefix: (_term, i, terms) => i === terms.length - 1,
        fuzzy: (term) => (term.length > 4 ? 0.15 : false),
      },
    });
    ms.addAll(entries);
    return ms;
  }, [entries]);

  const results = useMemo(() => {
    const query = q.trim();
    if (!index || !query) return [];
    // Every word must match; fall back to any word only when nothing matches them all.
    let hits = index.search(query, { combineWith: "AND" });
    if (!hits.length) hits = index.search(query);
    // Pages containing the exact phrase always come first.
    const phrase = query.toLowerCase();
    const ranked = (hits as unknown as (Entry & { score: number })[]).map((h) => ({
      ...h,
      exact: (h.title + " " + h.text).toLowerCase().includes(phrase),
    }));
    return ranked.sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score).slice(0, 12);
  }, [index, q]);

  if (!open) return null;

  /** Where the query appears: the whole phrase if present, otherwise its longest word. */
  const matchAt = (text: string) => {
    const query = q.trim().toLowerCase();
    const lower = text.toLowerCase();
    const i = lower.indexOf(query);
    if (i >= 0) return { i, term: query };
    const word = [...query.split(/\s+/)].sort((a, b) => b.length - a.length)[0] ?? "";
    return { i: word ? lower.indexOf(word) : -1, term: word };
  };

  const snippet = (text: string) => {
    const { i } = matchAt(text);
    const start = Math.max(0, i - 60);
    return (start > 0 ? "…" : "") + text.slice(start, start + 150) + "…";
  };

  /** Link straight to the matching passage, highlighted by the browser's text fragments. */
  const hrefFor = (r: Entry) => {
    const { i } = matchAt(r.text);
    const phrase = q.trim();
    return i >= 0 && r.text.toLowerCase().includes(phrase.toLowerCase())
      ? `${r.href}#:~:text=${encodeURIComponent(phrase)}`
      : r.href;
  };

  const go = (href: string) => {
    setOpen(false);
    // Text fragments only highlight on a full navigation, not a client-side route change.
    if (href.includes("#:~:text=")) window.location.assign(href);
    else router.push(href);
  };

  return (
    <div className="palette-backdrop" onClick={() => setOpen(false)}>
      <div className="palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <input
          ref={inputRef}
          value={q}
          placeholder="Search playbooks, notes, case studies, vendors…"
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
            if (e.key === "Enter" && results[sel]) go(hrefFor(results[sel]));
          }}
        />
        <ul>
          {!entries && <li className="empty">Loading…</li>}
          {entries && q && results.length === 0 && <li className="empty">Nothing matches “{q}”.</li>}
          {entries && !q && <li className="empty">Type to search across the whole OS.</li>}
          {results.map((r, i) => (
            <li key={r.id}>
              <a
                href={hrefFor(r)}
                className={i === sel ? "sel" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  go(hrefFor(r));
                }}
              >
                <span className="kind">{r.kind}</span>
                {r.title}
                <span className="snip">{snippet(r.text)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

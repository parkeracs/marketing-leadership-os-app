import Link from "next/link";
import { DEMO_MODE, Doc, allDocs, asList, byline, formatDate, resolveLink, unlink } from "@/lib/vault";
import { tacticTitle } from "@/components/Cards";
import { AdviceCta, HomeSearch } from "@/components/HomeActions";

type FeedItem = { doc: Doc; date: string; verb: "Added" | "Updated"; label: string; title: string; who: string | null };

const LABEL: Record<string, string> = {
  playbooks: "Playbook",
  library: "Library",
  "case-studies": "Case study",
  swipe: "Swipe",
};

/** Everything added or updated, newest first, from each collection's own date field. */
function feed(docs: Doc[]): FeedItem[] {
  const items: FeedItem[] = [];
  for (const d of docs) {
    const label = LABEL[d.collection];
    if (!label || d.name.startsWith("_")) continue;
    const FIELD: Record<string, string> = { playbooks: "last_reviewed", library: "clipped", "case-studies": "researched", swipe: "seen" };
    const field = FIELD[d.collection];
    const date = String(d.data[field ?? ""] ?? "").slice(0, 10);
    if (!date) continue;
    const hub = d.collection === "playbooks" && d.data.parent ? d.title.split(/:\s+/)[0] : null;
    items.push({
      doc: d,
      date,
      verb: d.collection === "playbooks" ? "Updated" : "Added",
      label,
      title: hub ? `${hub}: ${tacticTitle(d)}` : d.title,
      who: d.collection === "library" ? byline(d).who : null,
    });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** Flags /process-inbox writes when a new library note would change a playbook:
 *  "date · contradicts | newer figure | adds · [[note]] · reason". */
type Flag = { doc: Doc; title: string; date: string; kind: string; note: string; noteHref: string | null; reason: string };

function pendingUpdates(docs: Doc[]): Flag[] {
  const flags: Flag[] = [];
  for (const d of docs) {
    if (d.collection !== "playbooks") continue;
    const hub = d.data.parent ? d.title.split(/:\s+/)[0] : null;
    for (const line of asList(d.data.pending_updates)) {
      const [date = "", kind = "", note = "", ...rest] = line.split(" · ");
      const target = note.match(/\[\[([^\]|]+)/)?.[1];
      flags.push({
        doc: d,
        title: hub ? `${hub}: ${tacticTitle(d)}` : d.title,
        date: date.trim(),
        kind: kind.trim(),
        note: unlink(note).trim(),
        noteHref: target ? resolveLink(target) : null,
        reason: rest.join(" · ").trim(),
      });
    }
  }
  // Contradictions first: the playbook may now be giving out-of-date advice.
  const rank = (k: string) => (k === "contradicts" ? 0 : k === "newer figure" ? 1 : 2);
  return flags.sort((a, b) => rank(a.kind) - rank(b.kind) || b.date.localeCompare(a.date));
}

/** Library notes arrive in batches, so each day's notes collapse into one row. */
type Row = FeedItem | { batch: true; date: string; count: number };

function withBatches(items: FeedItem[]): Row[] {
  const rows: Row[] = [];
  const counts = new Map<string, number>();
  for (const i of items) if (i.doc.collection === "library") counts.set(i.date, (counts.get(i.date) ?? 0) + 1);
  const seen = new Set<string>();
  for (const i of items) {
    if (i.doc.collection !== "library" || (counts.get(i.date) ?? 0) < 4) rows.push(i);
    else if (!seen.has(i.date)) {
      seen.add(i.date);
      rows.push({ batch: true, date: i.date, count: counts.get(i.date)! });
    }
  }
  return rows;
}

export default function Home() {
  const docs = allDocs();
  const items = withBatches(feed(docs)).slice(0, 15);
  const flags = pendingUpdates(docs);

  return (
    <>
      <h1 className="sr-only">Home</h1>
      <HomeSearch />
      <AdviceCta demo={DEMO_MODE} />

      {flags.length > 0 && (
        <>
          <h2 className="section-title">Playbooks to update</h2>
          <div className="rows">
            {flags.map((f, i) => (
              <div key={f.doc.slug + i} className="row">
                <span className="t">
                  <Link href={`/playbooks/${f.doc.slug}`}>{f.title}</Link>
                </span>
                <span className="by">
                  <span className={f.kind === "contradicts" ? "flag-kind warn" : "flag-kind"}>{f.kind}</span>
                  {f.reason && <> · {f.reason}</>}
                  {f.note && (
                    <span className="pub">
                      {" "}· from {f.noteHref ? <Link href={f.noteHref}>{f.note}</Link> : f.note}
                    </span>
                  )}
                </span>
                <span className="side faint" style={{ fontSize: 13.5 }}>Flagged {formatDate(f.date)}</span>
              </div>
            ))}
          </div>
          <p className="faint" style={{ fontSize: 14, margin: "12px 0 0" }}>
            Run <code>/build-playbook &lt;job&gt; refresh</code> to work through these.
          </p>
        </>
      )}

      <h2 className="section-title">
        Recently added and updated <Link href="/library" className="more">Library</Link>
      </h2>
      <div className="rows">
        {items.map((i) =>
          "batch" in i ? (
            <div key={"batch" + i.date} className="row">
              <span className="t">
                <Link href="/library">{i.count} notes added to the library</Link>
              </span>
              <span className="by">Library</span>
              <span className="side faint" style={{ fontSize: 13.5 }}>Added {formatDate(i.date)}</span>
            </div>
          ) : (
          <div key={i.doc.collection + i.doc.slug} className="row">
            <span className="t">
              <Link href={`/${i.doc.collection}/${i.doc.slug}`}>{i.title}</Link>
            </span>
            <span className="by">
              {i.label}
              {i.who && <span className="pub"> · {i.who}</span>}
            </span>
            <span className="side faint" style={{ fontSize: 13.5 }}>
              {i.verb} {formatDate(i.date)}
            </span>
          </div>
          )
        )}
      </div>
    </>
  );
}

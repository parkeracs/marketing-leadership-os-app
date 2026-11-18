import Link from "next/link";
import { Doc, unlink } from "@/lib/vault";
import { plainText } from "@/lib/markdown";
import { XCard } from "./XCard";
import { Icon } from "./Icons";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function clip(s: string, n: number) {
  return s.length > n ? s.slice(0, n).replace(/\s\S*$/, "") + "…" : s;
}

/** The playbook's "The job:" / "The moment:" line, as a capitalised sentence. */
export function jobLine(doc: Doc, n = 200): string {
  const job = doc.body.match(/\*\*The (?:job|moment|problem):\*\*\s*([^\n]+)/);
  const what = doc.body.match(/\*\*What it is:\*\*\s*([^\n]+)/);
  const s = plainText(job?.[1] ?? what?.[1] ?? doc.body.replace(/^#.*$/m, ""));
  const first = s.split(/(?<=[.!?])\s+(?=[A-Z])/)[0];
  return cap(clip(first, n));
}

export function caseSummary(doc: Doc, n = 260): string {
  const m = doc.body.match(/\[!summary\][^\n]*\n((?:>.*\n?)+)/);
  return clip(plainText(m ? m[1].replace(/\[\d+\]/g, "") : doc.body), n);
}

/** "Clay: founder advocacy" → "Founder advocacy". Splits on ": " so "1:1s: feedback" → "Feedback". */
export function tacticTitle(doc: Doc): string {
  return cap(doc.title.replace(/^.*?:\s+/, "")) || doc.title;
}

export function PlaybookCards({ docs, hubs }: { docs: Doc[]; hubs: Doc[] }) {
  const childrenOf = (hub: Doc) =>
    docs.filter((d) => unlink(d.data.parent) === hub.name).sort((a, b) => tacticTitle(a).localeCompare(tacticTitle(b)));
  return (
    <div className="stack">
      {hubs.map((hub) => {
        const kids = childrenOf(hub);
        return (
          <XCard
            key={hub.slug}
            title={hub.title}
            sub={jobLine(hub, 150)}
            meta={kids.length ? `${kids.length} focused guides` : undefined}
            href={`/playbooks/${hub.slug}`}
            openLabel={kids.length ? "Open the overview" : "Open playbook"}
          >
            {kids.length > 0 ? (
              <div className="guides">
                <h4>Focused guides</h4>
                <ul>
                  {kids.map((k) => (
                    <li key={k.slug}>
                      <Link href={`/playbooks/${k.slug}`}>
                        <span className="g-title">
                          {tacticTitle(k)}
                          {k.data.type === "meeting-guide" && <span className="g-tag">Meeting guide</span>}
                        </span>
                        <span className="g-sub">{jobLine(k, 120)}</span>
                        <Icon name="chevron" size={16} className="g-chev" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </XCard>
        );
      })}
    </div>
  );
}


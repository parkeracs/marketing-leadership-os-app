import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { allDocs, resolveLink } from "./vault";

function titleFor(name: string): string | undefined {
  const d = allDocs().find((x) => x.name.toLowerCase() === name.toLowerCase());
  return d && d.collection === "playbooks" ? d.title : undefined;
}

/** True when the target is a library note from outside the trusted sources (tier: web). */
function libraryNote(name: string) {
  return allDocs().find((x) => x.collection === "library" && x.name.toLowerCase() === name.toLowerCase());
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const IMG = /\.(png|jpe?g|gif|webp|svg)$/i;

export type PersonLinkOpt = { name: string; links: { key: string; href: string }[] };
export type RenderOptions = { citations?: boolean; hideSections?: RegExp[]; personLinks?: PersonLinkOpt[] };

const LINK_LABEL: Record<string, string> = { linkedin: "LinkedIn", x: "X", website: "Website", newsletter: "Newsletter" };

/** In "## Who built it", put each builder's profile links right after their bolded name. */
function linkPeople(md: string, people: PersonLinkOpt[]): string {
  const start = md.search(/^## Who built it\s*$/m);
  if (start < 0) return md;
  const rest = md.slice(start + 1);
  const next = rest.search(/^## /m);
  const end = next < 0 ? md.length : start + 1 + next;
  let section = md.slice(start, end);
  for (const p of people) {
    if (!p.links.length) continue;
    const links = p.links
      .map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noreferrer">${LINK_LABEL[l.key] ?? l.key}</a>`)
      .join(" · ");
    const bold = `**${p.name}**`;
    const i = section.indexOf(bold);
    if (i >= 0) section = section.slice(0, i + bold.length) + ` <span class="person-links">${links}</span>` + section.slice(i + bold.length);
  }
  return md.slice(0, start) + section + md.slice(end);
}

/** Numbered citations [n] become links to the matching entry in "## Sources". */
function linkCitations(md: string): string {
  const i = md.search(/^## Sources\s*$/m);
  if (i < 0) return md;
  const body = md.slice(0, i).replace(/\[(\d{1,3})\](?!\()/g, '<sup class="cite"><a href="#src-$1">$1</a></sup>');
  const sources = md.slice(i).replace(/^(\d{1,3})\.\s+/gm, '$1. <span class="src-anchor" id="src-$1"></span>');
  return body + sources;
}

/** Drop sections by heading, e.g. an empty "## My take" or the canon's "Blind spots". */
function hideSections(md: string, patterns: RegExp[]): string {
  let out = md;
  for (const p of patterns) out = out.replace(p, "");
  return out;
}

/** Turn Obsidian-flavoured markdown into plain markdown plus a little HTML. */
function preprocess(md: string, opts: RenderOptions = {}): string {
  let out = md;
  // Empty "My take" sections add nothing in the app.
  out = out.replace(/^## My take\s*\n(?=\s*(## |$))/gm, "");
  if (opts.hideSections) out = hideSections(out, opts.hideSections);
  if (opts.personLinks?.length) out = linkPeople(out, opts.personLinks);
  if (opts.citations) out = linkCitations(out);

  // Drop Dataview and Bases embeds; the app has its own views.
  out = out.replace(/```dataview[\s\S]*?```/g, "");
  out = out.replace(/!\[\[[^\]]+\.base(#[^\]]*)?\]\]/g, "");

  // Image + caption pairs become <figure>: ![[img.png]] followed by a *caption* line.
  out = out.replace(/^([ \t]*)!\[\[([^\]|]+?\.(?:png|jpe?g|gif|webp|svg))(?:\|[^\]]*)?\]\]\s*\n[ \t]*\*([^\n]+?)\*[ \t]*$/gim, (_m, indent: string, target: string, caption: string) => {
    const src = `/api/asset?path=${encodeURIComponent(target.trim())}`;
    const cap = esc(caption).replace(/(https?:\/\/[^\s,)]+[^\s,.)])/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
    return `${indent}<figure class="embed-fig"><img class="embed-img" src="${src}" alt="" loading="lazy"><figcaption>${cap}</figcaption></figure>\n`;
  });

  // Image embeds: ![[attachments/swipe/x.png]]
  out = out.replace(/!\[\[([^\]|]+?)(\|[^\]]*)?\]\]/g, (_m, target: string) => {
    if (IMG.test(target)) {
      const src = `/api/asset?path=${encodeURIComponent(target.trim())}`;
      return `<img class="embed-img" src="${src}" alt="" loading="lazy">`;
    }
    const href = resolveLink(target);
    return href ? `[${target.split("/").pop()}](${href})` : target;
  });

  // Wikilinks, including the table-escaped form [[a\|b]]
  out = out.replace(/\[\[([^\]]+?)\]\]/g, (_m, inner: string) => {
    const [target, alias] = inner.split(/\\?\|/);
    const href = resolveLink(target);
    const base = target.split("/").pop()!.replace(/\.md$/, "").trim();
    // Without an alias, show the note's title rather than its file name.
    const label = (alias ?? titleFor(base) ?? base).trim();
    if (!href) return `<span class="link-missing">${esc(label)}</span>`;
    if (href.startsWith("/api/asset")) return `<a class="link-file" href="${href}">${esc(label)}</a>`;
    const note = libraryNote(base);
    if (note && String(note.data.tier ?? "") === "web") {
      const title = note.data.corporate_data === true ? "Outside my trusted sources · corporate data" : "Outside my trusted sources";
      return `<a class="link-internal link-web" href="${href}" title="${title}">${esc(label)}</a>`;
    }
    return `<a class="link-internal" href="${href}">${esc(label)}</a>`;
  });

  // Callouts: > [!type] Title, followed by quoted lines
  const lines = out.split("\n");
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^>\s*\[!(\w+)\]\s*(.*)$/);
    if (!m) {
      result.push(lines[i]);
      continue;
    }
    const [, type, title] = m;
    const inner: string[] = [];
    while (i + 1 < lines.length && lines[i + 1].startsWith(">")) {
      inner.push(lines[++i].replace(/^>\s?/, ""));
    }
    result.push(
      `<div class="callout callout-${type.toLowerCase()}"><div class="callout-title">${esc(title || type)}</div>`,
      "",
      ...inner,
      "",
      `</div>`,
      ""
    );
  }
  return result.join("\n");
}

export async function renderMarkdown(md: string, opts: RenderOptions = {}): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(preprocess(md, opts));
  return String(file);
}

/** Plain text for search and excerpts. */
export function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[\[[^\]]+\]\]/g, " ")
    .replace(/\[\[([^\]|]+)(\\?\|([^\]]+))?\]\]/g, (_m, a: string, _b, alias) => alias ?? titleFor(a.split("/").pop()!) ?? a.split("/").pop())
    .replace(/\[!\w+\]/g, " ")
    .replace(/^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{0,}:?\s*$/gm, " ") // table separator rows (|---|---|)
    .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, " ") // horizontal rules
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, " ")
    .replace(/[#>*_`|[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}


/**
 * The pages you've read this session, in order, so a page can offer "back to where you were".
 * Kept in sessionStorage because links inside rendered notes are full page loads, which reset memory.
 * Back and forward (browser, swipe or our back link) pop the trail; any other visit pushes onto it.
 */

export type Visit = { path: string; title: string };

const KEY = "reading-trail";
const BACK_FLAG = "reading-trail:back";
const MAX = 50;
const SUFFIX = / · Marketing Leadership OS$/;
let loadChecked = false;

function read(): Visit[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(trail: Visit[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(trail.slice(-MAX)));
  } catch {
    // Private mode or storage blocked: the back link falls back to the section link.
  }
}

export function pageTitle(): string {
  const t = document.title.replace(SUFFIX, "").trim();
  return !t || t === "Marketing Leadership OS" ? "Home" : t;
}

/** Called just before a history traversal, so the next visit knows it came from Back or Forward. */
export function markTraversal() {
  try {
    sessionStorage.setItem(BACK_FLAG, "1");
  } catch {}
}

function takeTraversalFlag(): boolean {
  try {
    const hit = sessionStorage.getItem(BACK_FLAG) === "1";
    sessionStorage.removeItem(BACK_FLAG);
    if (hit) return true;
  } catch {}
  // A full page load reached by Back or Forward counts once: for the page it loaded, not later in-app moves.
  if (loadChecked) return false;
  loadChecked = true;
  const nav = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === "back_forward";
}

/** Record that `path` is on screen. Safe to call more than once for the same page. */
export function recordVisit(path: string) {
  const trail = read();
  const top = trail[trail.length - 1];
  if (top?.path === path) return;
  const traversal = takeTraversalFlag();
  const prevIndex = trail.length - 2;
  if (traversal && trail[prevIndex]?.path === path) trail.pop();
  else trail.push({ path, title: pageTitle() });
  write(trail);
}

/** Refresh the stored title for the current page once Next has set it. */
export function updateTitle(path: string) {
  const trail = read();
  const top = trail[trail.length - 1];
  if (top?.path !== path) return;
  top.title = pageTitle();
  write(trail);
}

/** The page before the current one, if you reached this one from inside the app. */
export function previousVisit(path: string): Visit | null {
  const trail = read();
  if (trail[trail.length - 1]?.path !== path) return null;
  return trail[trail.length - 2] ?? null;
}

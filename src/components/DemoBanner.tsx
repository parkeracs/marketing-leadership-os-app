/** Public links shown to demo visitors. */
export const STARTER_KIT_URL = "https://github.com/parkeracs/marketing-leadership-os";
export const GUIDE_URL = "https://claude.ai/artifact/Bd818Roc7yQeGWyPULWXmA";
export const BUILDER_URL = "https://www.linkedin.com/in/parkeracs";

/** A slim bar across the top of every page in demo mode, so nobody mistakes sample content for the real thing. */
export function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      <span className="demo-pill">Demo</span>
      <span className="demo-text">
        Sample content in Marketing Leadership OS, built by{" "}
        <a href={BUILDER_URL} target="_blank" rel="noreferrer">
          Andy Parker
        </a>{" "}
        with Claude Code.
      </span>
      <a className="demo-link" href={STARTER_KIT_URL} target="_blank" rel="noreferrer">
        Get the free starter kit →
      </a>
    </div>
  );
}

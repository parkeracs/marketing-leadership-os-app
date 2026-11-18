"use client";

import { useEffect, useRef } from "react";

/** Public links shown to demo visitors. */
export const STARTER_KIT_URL = "https://github.com/parkeracs/marketing-leadership-os";
export const GUIDE_URL = "https://claude.ai/artifact/Bd818Roc7yQeGWyPULWXmA";
export const BUILDER_URL = "https://www.linkedin.com/in/parkeracs";

/**
 * A bar pinned to the top of every page in demo mode, so nobody mistakes sample content for the real thing.
 * It publishes its height as --banner-h, so the sticky sidebar and in-page anchors sit below it even when the text wraps.
 */
export function DemoBanner() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty("--banner-h", `${el.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--banner-h");
    };
  }, []);

  return (
    <div className="demo-banner" role="note" ref={ref}>
      <span className="demo-pill">Demo</span>
      <span className="demo-text">
        Sample content
        <span className="demo-credit">
          {" "}in Marketing Leadership OS, built by{" "}
          <a href={BUILDER_URL} target="_blank" rel="noreferrer">
            Andy Parker
          </a>{" "}
          with Claude Code
        </span>
        .
      </span>
      <a className="demo-link" href={GUIDE_URL} target="_blank" rel="noreferrer">
        Get the free starter kit →
      </a>
    </div>
  );
}

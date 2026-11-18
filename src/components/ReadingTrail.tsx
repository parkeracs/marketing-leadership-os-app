"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { markTraversal, previousVisit, recordVisit, updateTitle, type Visit } from "@/lib/readingTrail";

/** Records every page you open in the app. Mounted once in the app layout. */
export function TrailRecorder() {
  const path = usePathname();
  useEffect(() => {
    recordVisit(path);
    // Next sets the new title a moment after a client-side navigation.
    const t = setTimeout(() => updateTitle(path), 400);
    return () => clearTimeout(t);
  }, [path]);
  useEffect(() => {
    const onPop = () => markTraversal();
    // Pages restored from the back-forward cache don't re-run effects.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        markTraversal();
        recordVisit(location.pathname);
      }
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);
  return null;
}

/**
 * The top of a page: the breadcrumb up to the section (or playbook hub), plus, when you got here
 * from another page in the app, a button back to that page, at the point where you were reading.
 */
export function BackLink({ fallback }: { fallback: { href: string; label: string } }) {
  const path = usePathname();
  const router = useRouter();
  const [prev, setPrev] = useState<Visit | null>(null);

  useEffect(() => {
    // Record here too: this runs before the layout's recorder, and both calls are safe.
    recordVisit(path);
    // Shown after the first paint: the trail lives in the browser, so the server renders the fallback.
    const t = setTimeout(() => setPrev(previousVisit(path)), 0);
    return () => clearTimeout(t);
  }, [path]);

  return (
    <nav className="back-row">
      {/* The breadcrumb always stays: up to the section, or to the playbook's hub. */}
      <Link href={fallback.href} className="back">
        <Icon name="chevron" size={15} /> {fallback.label}
      </Link>
      {prev && (
        <button
          type="button"
          className="back-button"
          title={`Back to ${prev.title}`}
          onClick={() => {
            markTraversal();
            router.back();
          }}
        >
          <Icon name="return" size={15} /> <span className="back-label">Back to {prev.title}</span>
        </button>
      )}
    </nav>
  );
}

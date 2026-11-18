"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import { openSearch } from "./SearchPalette";
import { GUIDE_URL, STARTER_KIT_URL } from "./DemoBanner";

/** The big search box on the home page; opens the same palette as ⌘K. */
export function HomeSearch() {
  return (
    <button className="home-search" onClick={openSearch}>
      <Icon name="search" size={20} />
      <span>Search playbooks, the library, case studies and the swipe file</span>
      <kbd>⌘K</kbd>
    </button>
  );
}

/**
 * Advice runs in Claude Code inside the vault, not in the web app. The button copies
 * "/advise " to the clipboard and opens the Claude desktop app, ready to paste.
 * Demo visitors have no vault, so they get the explanation and a route to their own copy instead.
 */
export function AdviceCta({ demo = false }: { demo?: boolean }) {
  if (demo) return <DemoAdviceCta />;
  return <OwnerAdviceCta />;
}

function DemoAdviceCta() {
  return (
    <section className="advice-cta">
      <div>
        <h2>Ask for advice</h2>
        <p>
          In your own copy, <code>/advise</code> answers a question from your playbooks and library, with citations.{" "}
          <code>/advise-deep</code> researches the big ones against your company context. Both run in Claude Code, on a
          vault you own.
        </p>
      </div>
      <a className="button" href={GUIDE_URL} target="_blank" rel="noreferrer">
        Set up your own <Icon name="external" size={15} />
      </a>
      <p className="faint advice-hint">
        Free and open source. <a href={STARTER_KIT_URL} target="_blank" rel="noreferrer">See the starter kit on GitHub</a>.
      </p>
    </section>
  );
}

function OwnerAdviceCta() {
  const [copied, setCopied] = useState(false);
  const open = async () => {
    try {
      await navigator.clipboard.writeText("/advise ");
      setCopied(true);
    } catch {
      setCopied(false);
    }
    window.location.href = "claude://";
  };
  return (
    <section className="advice-cta">
      <div>
        <h2>Ask for advice</h2>
        <p>
          Get an answer grounded in your playbooks with <code>/advise</code>, or a researched, situational deep dive with{" "}
          <code>/advise-deep</code>. Runs in Claude Code, in the marketing-os project.
        </p>
      </div>
      <button className="button" onClick={open}>
        Open Claude <Icon name="external" size={15} />
      </button>
      {copied && <p className="faint advice-hint">Copied <code>/advise</code>. Paste it into your marketing-os session.</p>}
    </section>
  );
}

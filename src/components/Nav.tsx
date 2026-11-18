"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mark } from "./Mark";
import { Icon } from "./Icons";
import { openSearch } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";

type Item = { href: string; label: string; icon: string; count?: number };

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

/** In demo mode there is no sign-in, so the Account link is hidden. */
export function Sidebar({ items, demo = false }: { items: Item[]; demo?: boolean }) {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <Mark />
        <span className="brand-name">Marketing Leadership OS</span>
      </Link>
      <button className="search-trigger" onClick={openSearch}>
        <Icon name="search" size={16} />
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      <nav className="nav">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={isActive(path, i.href) ? "active" : ""}>
            <Icon name={i.icon} />
            <span className="label">{i.label}</span>
            {i.count != null && <span className="count">{i.count}</span>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-foot">
        <ThemeToggle />
        {!demo && (
          <Link href="/account" className={`sidebar-account${isActive(path, "/account") ? " active" : ""}`}>
            Account
          </Link>
        )}
      </div>
    </aside>
  );
}

const MORE = ["/case-studies", "/swipe", "/martech", "/canon", "/principles"];

/**
 * Phone and portrait-iPad navigation: four destinations plus a More menu for the rest,
 * so every section is reachable without the sidebar.
 */
export function BottomNav({ items, demo = false }: { items: Item[]; demo?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  // Close the menu whenever the page changes.
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sections = MORE.map((href) => items.find((i) => i.href === href)).filter((i): i is Item => Boolean(i));
  const more = demo ? sections : [...sections, { href: "/account", label: "Account", icon: "canon" }];
  const moreActive = more.some((i) => isActive(path, i.href));
  const link = (href: string, label: string, icon: string) => (
    <Link href={href} className={isActive(path, href) && !open ? "active" : ""}>
      <Icon name={icon} size={21} />
      {label}
    </Link>
  );
  return (
    <>
      {open && (
        <>
          <div className="more-backdrop" onClick={() => setOpen(false)} />
          <div className="more-sheet" id="more-menu" role="menu">
            {more.map((i) => (
              <Link key={i.href} href={i.href} role="menuitem" className={isActive(path, i.href) ? "active" : ""} onClick={() => setOpen(false)}>
                <Icon name={i.href === "/account" ? "account" : i.icon} size={20} />
                <span>{i.label}</span>
                {i.count != null && <span className="count">{i.count}</span>}
              </Link>
            ))}
          </div>
        </>
      )}
      <nav className="bottom-nav">
        {link("/", "Home", "home")}
        {link("/playbooks", "Playbooks", "playbooks")}
        <button onClick={openSearch}>
          <Icon name="search" size={21} />
          Search
        </button>
        {link("/library", "Library", "library")}
        <button
          className={open || moreActive ? "active" : ""}
          aria-expanded={open}
          aria-controls="more-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name="more" size={21} />
          More
        </button>
      </nav>
    </>
  );
}

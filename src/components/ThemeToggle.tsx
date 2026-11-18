"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./Icons";

type Theme = "light" | "dark";
const KEY = "theme";
const EVENT = "themechange";
const media = () => window.matchMedia("(prefers-color-scheme: dark)");

/** The theme in force: a saved choice on <html data-theme>, otherwise the system setting. */
function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return media().matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const m = media();
  m.addEventListener("change", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    m.removeEventListener("change", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * Runs in <head> before first paint, so a saved choice applies without a flash of the other theme.
 * With nothing saved, the CSS follows the system setting.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

/** Switches between light and dark. The choice is remembered in this browser only. */
export function ThemeToggle() {
  // null on the server, where the theme isn't known yet.
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage blocked (private window): the switch still works for this visit.
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${next} mode`}>
      <Icon name={next === "dark" ? "moon" : "sun"} size={16} />
      <span>{theme ? `${next === "dark" ? "Dark" : "Light"} mode` : "Theme"}</span>
    </button>
  );
}

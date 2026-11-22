"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "rentora_theme";
const THEME_EVENT = "rentora-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = savedTheme ? savedTheme === "dark" : prefersDark;
    document.documentElement.dataset.theme = useDark ? "dark" : "light";
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  function toggleTheme() {
    const nextDark = !getSnapshot();
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    window.localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      className="grid size-10 place-items-center rounded-full border border-[#e2e7e2] text-[#536159] transition hover:bg-[#edf0ec]"
      onClick={toggleTheme}
      type="button"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

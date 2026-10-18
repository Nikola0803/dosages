import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the element referenced by the current URL hash whenever it changes.
 * Lets section links work from any route (home or sub-pages).
 */
export function useHashScroll() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hash, pathname]);
}
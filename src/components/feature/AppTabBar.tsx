import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActiveProtocol, isExpiringSoon, getPendingReview } from "@/lib/protocol";
import { isStandalone } from "@/lib/standalone";

const TABS = [
  { path: "/",        icon: "ri-home-5",       iconFill: "ri-home-5-fill",  label: "Home"       },
  { path: "/start",   icon: "ri-calculator-2", iconFill: "ri-calculator-2-fill", label: "Calculator" },
  { path: "/tracker", icon: "ri-flask-2",      iconFill: "ri-flask-2-fill", label: "My Cycle"   },
] as const;

function useBadge() {
  const [badge, setBadge] = useState<"alert" | "review" | null>(null);

  useEffect(() => {
    function check() {
      const pending = getPendingReview();
      if (pending) { setBadge("review"); return; }
      const active = getActiveProtocol();
      if (active && isExpiringSoon(active)) { setBadge("alert"); return; }
      setBadge(null);
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return badge;
}

export default function AppTabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const badge = useBadge();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isStandalone());
  }, []);

  if (!visible) return null;

  function activeFor(tabPath: string) {
    if (tabPath === "/") return pathname === "/";
    return pathname.startsWith(tabPath);
  }

  return (
    <nav
      aria-label="App navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-black/[0.08] bg-white/80 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-foreground-950/85"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {TABS.map((tab) => {
        const active = activeFor(tab.path);
        const showBadge = tab.path === "/tracker" && badge !== null;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center justify-center gap-[3px] py-2.5 transition-colors active:scale-95 ${
              active ? "text-primary-600" : "text-foreground-400"
            }`}
          >
            {/* Badge dot */}
            {showBadge && (
              <span
                aria-label={badge === "review" ? "Review ready" : "Running low"}
                className={`absolute right-[calc(50%-10px)] top-2 h-2 w-2 rounded-full ${
                  badge === "review" ? "bg-primary-500" : "bg-accent-500"
                }`}
              />
            )}

            {/* Icon */}
            <span className="relative text-[22px] leading-none">
              <i className={active ? tab.iconFill : tab.icon} />
            </span>

            {/* Label */}
            <span
              className={`text-[10px] font-medium leading-none tracking-tight ${
                active ? "text-primary-600" : "text-foreground-400"
              }`}
            >
              {tab.label}
            </span>

            {/* Active pip (iOS-style) */}
            {active && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

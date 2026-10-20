import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActiveProtocol, isExpiringSoon, getPendingReview } from "@/lib/protocol";
import { isStandalone } from "@/lib/standalone";

const TABS = [
  { path: "/",        icon: "ri-home-5-line",      iconFill: "ri-home-5-fill",       label: "Home"      },
  { path: "/start",   icon: "ri-flask-line",        iconFill: "ri-flask-fill",        label: "Build"     },
  { path: "/tracker", icon: "ri-calendar-check-line", iconFill: "ri-calendar-check-fill", label: "My Cycle" },
  { path: "/shop",    icon: "ri-store-2-line",      iconFill: "ri-store-2-fill",      label: "Shop"      },
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

  useEffect(() => { setVisible(isStandalone()); }, []);

  if (!visible) return null;
  if (pathname === "/welcome") return null;

  function activeFor(tabPath: string) {
    if (tabPath === "/") return pathname === "/";
    return pathname.startsWith(tabPath);
  }

  return (
    <nav
      aria-label="App navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/[0.07] bg-white/90 backdrop-blur-2xl dark:border-white/[0.07] dark:bg-foreground-950/90"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const active = activeFor(tab.path);
          const showBadge = tab.path === "/tracker" && badge !== null;

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 active:opacity-70"
            >
              {/* Badge dot */}
              {showBadge && (
                <span
                  aria-label={badge === "review" ? "Review ready" : "Running low"}
                  className={`absolute right-[calc(50%-12px)] top-2.5 h-2 w-2 rounded-full ring-2 ring-white ${
                    badge === "review" ? "bg-primary-500" : "bg-accent-500"
                  }`}
                />
              )}

              {/* Icon with active pill background */}
              <span className={`relative flex h-8 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                active ? "bg-primary-100" : ""
              }`}>
                <i className={`${active ? tab.iconFill : tab.icon} text-[22px] leading-none transition-colors duration-200 ${
                  active ? "text-primary-600" : "text-foreground-400"
                }`} />
              </span>

              {/* Label */}
              <span className={`text-[11px] font-semibold leading-none tracking-tight transition-colors duration-200 ${
                active ? "text-primary-600" : "text-foreground-400"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

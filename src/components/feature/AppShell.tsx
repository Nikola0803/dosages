import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

interface AppShellProps {
  title?: string;
  showBack?: boolean;
  rightSlot?: ReactNode;
  children: ReactNode;
  noPad?: boolean; // set true when the child handles its own top spacing
}

export default function AppShell({ title, showBack, rightSlot, children, noPad }: AppShellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      {/* ── Native-style top bar ── */}
      <header
        className="fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex h-14 items-center px-4">
          {/* Left: back or logo */}
          {showBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-primary-600 active:opacity-60"
            >
              <i className="ri-arrow-left-s-line text-xl leading-none" />
              <span className="text-sm font-medium">Back</span>
            </button>
          ) : (
            <Link to="/" className="font-heading text-lg font-semibold tracking-tight text-foreground-950">
              Vial<em className="text-primary-400 not-italic">Calc</em>
            </Link>
          )}

          {/* Centre title */}
          {title && (
            <p className="absolute left-1/2 -translate-x-1/2 font-heading text-[15px] font-semibold text-foreground-950">
              {title}
            </p>
          )}

          {/* Right slot */}
          <div className="ml-auto">{rightSlot}</div>
        </div>
      </header>

      {/* ── Scrollable content area ── */}
      <main
        className={`flex-1 ${noPad ? "" : "px-4"}`}
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}

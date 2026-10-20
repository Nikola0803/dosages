import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActiveProtocol, getDaysRemaining, getProgressPct, isExpiringSoon } from "@/lib/protocol";
import type { Protocol } from "@/lib/protocol";
import AppShell from "@/components/feature/AppShell";
import VialIcon from "@/components/feature/VialIcon";

const GOAL_LABELS: Record<string, string> = {
  fat: "Fat Loss",
  muscle: "Muscle",
  recovery: "Recovery",
  longevity: "Longevity",
  cognitive: "Cognitive",
  immune: "Immune",
};

const GOAL_TOP: Record<string, { slug: string; name: string }[]> = {
  fat:       [{ slug: "semaglutide", name: "Semaglutide" }, { slug: "tirzepatide", name: "Tirzepatide" }, { slug: "aod-9604", name: "AOD-9604" }],
  muscle:    [{ slug: "ipamorelin", name: "Ipamorelin" }, { slug: "cjc-1295-no-dac", name: "CJC-1295" }, { slug: "tb-500", name: "TB-500" }],
  recovery:  [{ slug: "bpc-157", name: "BPC-157" }, { slug: "tb-500", name: "TB-500" }, { slug: "kpv", name: "KPV" }],
  longevity: [{ slug: "epitalon", name: "Epitalon" }, { slug: "mots-c", name: "MOTS-c" }, { slug: "thymosin-alpha-1", name: "Thymosin α-1" }],
  cognitive: [{ slug: "semax", name: "Semax" }, { slug: "selank", name: "Selank" }, { slug: "cerebrolysin", name: "Cerebrolysin" }],
  immune:    [{ slug: "thymosin-alpha-1", name: "Thymosin α-1" }, { slug: "ll-37", name: "LL-37" }, { slug: "vip", name: "VIP" }],
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function MiniCycleCard({ p }: { p: Protocol }) {
  const navigate = useNavigate();
  const pct   = getProgressPct(p);
  const days  = getDaysRemaining(p);
  const soon  = isExpiringSoon(p);
  const done  = days === 0;
  const r = 20;
  const circ = 2 * Math.PI * r;

  return (
    <button
      type="button"
      onClick={() => navigate("/tracker")}
      className={`w-full text-left rounded-3xl border-2 p-4 bg-white active:scale-[0.98] transition-transform ${
        soon ? "border-accent-300" : "border-primary-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Mini ring */}
        <div className="relative flex-shrink-0">
          <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
            <circle cx="26" cy="26" r={r} fill="none" strokeWidth="5" className="stroke-background-100" />
            <circle
              cx="26" cy="26" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ - (pct / 100) * circ}
              className={soon ? "stroke-accent-500" : "stroke-primary-500"}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <VialIcon categorySlug={p.categorySlug} size={20} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-400">Active cycle</p>
          <p className="font-heading text-base font-bold text-foreground-950 truncate">{p.peptideName}</p>
          <p className={`text-sm font-semibold ${soon ? "text-accent-600" : done ? "text-primary-600" : "text-foreground-600"}`}>
            {done ? "Cycle complete" : `${days} day${days !== 1 ? "s" : ""} left`}
          </p>
        </div>

        <i className="ri-arrow-right-s-line text-xl text-foreground-300" />
      </div>
    </button>
  );
}

export default function AppHome() {
  const navigate   = useNavigate();
  const [active, setActive]   = useState<Protocol | null>(null);
  const [goal, setGoal]       = useState<string | null>(null);

  useEffect(() => {
    setActive(getActiveProtocol());
    setGoal(localStorage.getItem("vc-goal"));
  }, []);

  const topPicks = goal ? (GOAL_TOP[goal] ?? []) : [];

  return (
    <AppShell>
      {/* Greeting */}
      <div className="pt-4 pb-2">
        <p className="text-sm text-foreground-500">{greeting()}</p>
        <h1 className="font-heading text-2xl font-bold text-foreground-950 leading-tight">
          {goal ? `${GOAL_LABELS[goal] ?? "Research"} stack` : "Your peptide toolkit"}
        </h1>
      </div>

      {/* Active cycle card */}
      {active && (
        <div className="mt-4">
          <MiniCycleCard p={active} />
        </div>
      )}

      {/* Calculator CTA */}
      <button
        type="button"
        onClick={() => navigate("/start")}
        className="mt-4 w-full rounded-3xl bg-primary-500 px-5 py-5 text-left shadow-sm active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-200">Step-by-step</p>
            <p className="font-heading text-lg font-bold text-white leading-snug">
              Reconstitution<br />Calculator
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <i className="ri-calculator-2-line text-2xl text-white" />
          </div>
        </div>
        <p className="mt-2 text-sm text-primary-100">
          Enter vial size and get the exact water volume and syringe line.
        </p>
      </button>

      {/* Goal-based quick-launch */}
      {topPicks.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-400">
            Your {GOAL_LABELS[goal!]?.toLowerCase()} peptides
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {topPicks.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => navigate(`/start?peptide=${p.slug}`)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-background-200 bg-white px-2 py-3 text-center active:scale-[0.96] transition-transform"
              >
                <VialIcon categorySlug="" size={32} />
                <span className="text-[10px] font-semibold leading-tight text-foreground-800">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No goal set — generic shortcuts */}
      {!goal && (
        <div className="mt-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-400">
            Popular compounds
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { slug: "bpc-157", name: "BPC-157" },
              { slug: "semaglutide", name: "Semaglutide" },
              { slug: "ipamorelin", name: "Ipamorelin" },
            ].map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => navigate(`/start?peptide=${p.slug}`)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-background-200 bg-white px-2 py-3 text-center active:scale-[0.96] transition-transform"
              >
                <VialIcon categorySlug="" size={32} />
                <span className="text-[10px] font-semibold leading-tight text-foreground-800">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

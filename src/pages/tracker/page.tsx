import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProtocols, saveProtocol, getDaysRemaining, getProgressPct,
  isExpiringSoon, getPendingReview, type Protocol,
} from "@/lib/protocol";
import VialIcon from "@/components/feature/VialIcon";
import CycleReview from "@/components/feature/CycleReview";
import AppShell from "@/components/feature/AppShell";

function formatDate(str: string) {
  return new Date(str + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" strokeWidth="8" className="stroke-background-200" />
      <circle
        cx="48" cy="48" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className={`transition-all duration-700 ${pct >= 80 ? 'stroke-accent-500' : 'stroke-primary-500'}`}
      />
    </svg>
  );
}

function ActiveCard({ p, onReview, onAbandon }: {
  p: Protocol;
  onReview: () => void;
  onAbandon: () => void;
}) {
  const pct  = getProgressPct(p);
  const days = getDaysRemaining(p);
  const soon = isExpiringSoon(p);
  const done = days === 0;
  const navigate = useNavigate();

  return (
    <div className={`rounded-3xl border-2 bg-white p-5 shadow-sm transition-colors ${
      soon ? 'border-accent-300' : 'border-background-100'
    }`}>
      {soon && !done && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-800">
          <i className="ri-alarm-warning-line text-base" />
          Running low. Time to reorder!
        </div>
      )}
      {done && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700">
          <i className="ri-check-double-line text-base" />
          Cycle complete. Leave a quick review?
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} />
          <div className="absolute inset-0 flex items-center justify-center">
            <VialIcon categorySlug={p.categorySlug} size={32} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-lg font-bold text-foreground-950 truncate">{p.peptideName}</p>
          <p className="text-sm text-foreground-500">
            {p.vialMg} mg · {p.doseMcg} mcg/dose · {p.dosesPerVial} doses
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`font-heading text-3xl font-bold leading-none ${
              soon ? 'text-accent-600' : 'text-primary-600'
            }`}>
              {done ? '✓' : days}
            </span>
            {!done && <span className="text-sm text-foreground-500">days left</span>}
          </div>
          <p className="mt-0.5 text-xs text-foreground-400">
            {formatDate(p.startedAt)} → {formatDate(p.endsAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {done ? (
          <button
            type="button"
            onClick={onReview}
            className="flex-1 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white active:scale-[0.97]"
          >
            Leave a Review
          </button>
        ) : soon ? (
          <button
            type="button"
            onClick={() => navigate(`/start?peptide=${p.peptideSlug}`)}
            className="flex-1 rounded-full bg-accent-500 py-2.5 text-sm font-semibold text-white active:scale-[0.97]"
          >
            Reorder. Calculate new vial
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(`/start?peptide=${p.peptideSlug}`)}
            className="flex-1 rounded-full bg-primary-50 py-2.5 text-sm font-semibold text-primary-700 active:scale-[0.97]"
          >
            Recalculate dose
          </button>
        )}
        <button
          type="button"
          onClick={onAbandon}
          className="rounded-full border border-background-200 px-4 py-2.5 text-sm text-foreground-400 active:scale-[0.97]"
          title="End this cycle"
        >
          <i className="ri-stop-circle-line" />
        </button>
      </div>
    </div>
  );
}

function PastCard({ p }: { p: Protocol }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-background-100 bg-white p-4">
      <VialIcon categorySlug={p.categorySlug} size={30} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground-900 truncate">{p.peptideName}</p>
        <p className="text-xs text-foreground-400">
          {formatDate(p.startedAt)} → {formatDate(p.endsAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {p.reviewRating && (
          <span className="text-sm">{'⭐'.repeat(p.reviewRating)}</span>
        )}
        {p.reviewWorked !== undefined && (
          <span className="text-xs text-foreground-400">
            {p.reviewWorked ? '👍 Worked' : '👎 Didn\'t work'}
          </span>
        )}
        {!p.reviewSubmitted && (
          <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] text-foreground-400">
            {p.status}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [reviewProtocol, setReviewProtocol] = useState<Protocol | null>(null);
  const navigate = useNavigate();

  function reload() {
    setProtocols(getProtocols());
  }

  useEffect(() => {
    reload();
    // Auto-surface review for completed cycle
    const pending = getPendingReview();
    if (pending) setReviewProtocol(pending);
  }, []);

  const active = protocols.filter((p) => p.status === 'active');
  const past   = protocols.filter((p) => p.status !== 'active');

  function handleAbandon(p: Protocol) {
    saveProtocol({ ...p, status: 'abandoned' });
    reload();
  }

  return (
    <AppShell title="My Cycle">
      <div className="pt-4 space-y-4">
        {active.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
              <i className="ri-flask-2-line text-3xl text-primary-500" />
            </div>
            <p className="font-heading text-xl font-bold text-foreground-950">No active cycle</p>
            <p className="mt-1 text-sm text-foreground-500 max-w-xs">
              Go to the calculator, reconstitute your vial, and tap "Track this cycle" to start.
            </p>
            <button
              type="button"
              onClick={() => navigate('/start')}
              className="mt-6 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.97]"
            >
              Open Calculator →
            </button>
          </div>
        )}

        {active.map((p) => (
          <ActiveCard
            key={p.id}
            p={p}
            onReview={() => setReviewProtocol(p)}
            onAbandon={() => handleAbandon(p)}
          />
        ))}

        {past.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">Past cycles</p>
            <div className="space-y-2">
              {past.map((p) => <PastCard key={p.id} p={p} />)}
            </div>
          </div>
        )}
      </div>

      {reviewProtocol && (
        <CycleReview
          protocol={reviewProtocol}
          onClose={() => { setReviewProtocol(null); reload(); }}
        />
      )}
    </AppShell>
  );
}

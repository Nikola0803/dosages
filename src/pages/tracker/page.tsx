import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProtocols, saveProtocol, getDaysRemaining, getProgressPct,
  isExpiringSoon, getPendingReview, getTodaysSlots, getTodaysLogForProtocol,
  logDose, removeDoseLog, isRestDay, type Protocol, type DoseLog,
} from "@/lib/protocol";
import { fetchProducts, type ShopProduct } from "@/lib/products";
import VialIcon from "@/components/feature/VialIcon";
import CycleReview from "@/components/feature/CycleReview";
import ScheduleSheet from "@/components/feature/ScheduleSheet";
import AppShell from "@/components/feature/AppShell";

const TODAY = new Date().toISOString().split("T")[0];

function formatDate(str: string) {
  return new Date(str + "T00:00:00").toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Today's dose checklist ────────────────────────────────────────────────

function TodaySection({
  protocols,
  onRefresh,
}: {
  protocols: Protocol[];
  onRefresh: () => void;
}) {
  const scheduled = protocols.filter((p) => (p.doseTimes?.length ?? 0) > 0);
  if (!scheduled.length) return null;

  const anyActive = scheduled.some((p) => !isRestDay(p, TODAY) && (p.doseTimes?.length ?? 0) > 0);

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">
        Today's doses
      </p>
      <div className="space-y-2">
        {scheduled.map((p) => (
          <ProtocolDoseCard key={p.id} protocol={p} onRefresh={onRefresh} />
        ))}
      </div>
      {!anyActive && (
        <p className="mt-2 text-center text-xs text-foreground-400">Rest day — no doses scheduled today.</p>
      )}
    </div>
  );
}

function ProtocolDoseCard({ protocol: p, onRefresh }: { protocol: Protocol; onRefresh: () => void }) {
  const slots    = getTodaysSlots(p, TODAY);
  const restDay  = isRestDay(p, TODAY);
  const [logged, setLogged]   = useState(() => getTodaysLogForProtocol(p.id));
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  function refreshLogged() {
    setLogged(getTodaysLogForProtocol(p.id));
  }

  if (restDay) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-background-100 bg-white px-4 py-3">
        <VialIcon categorySlug={p.categorySlug} size={24} blank />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground-900 truncate">{p.peptideName}</p>
          <p className="text-xs text-foreground-400">Rest day</p>
        </div>
        <span className="text-[11px] font-medium text-foreground-300 bg-background-100 rounded-full px-2 py-0.5">OFF</span>
      </div>
    );
  }

  if (!slots.length) return null;

  function handleCheck(slotIndex: number, existingLog: DoseLog | undefined) {
    if (existingLog) {
      removeDoseLog(existingLog.id);
      refreshLogged();
      onRefresh();
    } else {
      if (noteFor === slotIndex) {
        logDose(p.id, slotIndex, noteText.trim() || undefined);
        setNoteFor(null);
        setNoteText("");
        refreshLogged();
        onRefresh();
      } else {
        setNoteFor(slotIndex);
        setNoteText("");
      }
    }
  }

  return (
    <div className="rounded-2xl border border-background-100 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <VialIcon categorySlug={p.categorySlug} size={24} blank />
        <p className="flex-1 text-sm font-semibold text-foreground-900 truncate">{p.peptideName}</p>
        <p className="text-xs text-foreground-400">
          {slots.length === 1 ? "1 dose" : `${slots.length} doses`} today
        </p>
      </div>
      <div className="divide-y divide-background-50 border-t border-background-100">
        {slots.map((time, i) => {
          const entry = logged.find((l) => l.slotIndex === i);
          const done  = Boolean(entry);
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => handleCheck(i, entry)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-background-50"
              >
                <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-primary-500 bg-primary-500"
                    : "border-background-300 bg-white"
                }`}>
                  {done && <i className="ri-check-line text-xs text-white" />}
                </span>
                <span className={`flex-1 text-sm font-medium ${done ? "text-foreground-400 line-through" : "text-foreground-900"}`}>
                  {formatTime(time)}
                </span>
                {entry?.notes && (
                  <span className="text-xs text-foreground-400 truncate max-w-[100px]">{entry.notes}</span>
                )}
                {!done && <i className="ri-edit-line text-foreground-300 text-sm" />}
              </button>
              {noteFor === i && (
                <div className="px-4 pb-3 flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Quick note (optional)..."
                    autoFocus
                    className="flex-1 rounded-xl border border-background-200 bg-background-50 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCheck(i, undefined)}
                    className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white active:scale-[0.97]"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteFor(null)}
                    className="rounded-xl border border-background-200 px-3 py-2 text-sm text-foreground-400 active:scale-[0.97]"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Contextual reorder card ───────────────────────────────────────────────

function ReorderCard({ peptideSlug }: { peptideSlug: string }) {
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(peptideSlug)
      .then((items) => setProduct(items[0] ?? null))
      .catch(() => {});
  }, [peptideSlug]);

  if (!product) return null;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        <i className="ri-store-2-line text-xl text-accent-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-accent-900 truncate">
          {product.name} {product.variantLabel}
        </p>
        <p className="text-[11px] text-accent-700">
          ${(product.priceCents / 100).toFixed(2)}
          {product.purity && ` · ${product.purity}`}
        </p>
      </div>
      {product.coas.length > 0 && (
        <a
          href={product.coas[0].url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 items-center justify-center rounded-full border border-accent-200 bg-white px-2.5 text-[11px] font-semibold text-accent-700 active:scale-[0.97]"
        >
          COA
        </a>
      )}
      <a
        href={product.storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex h-8 items-center justify-center rounded-full bg-accent-500 px-3 text-[11px] font-semibold text-white active:scale-[0.97]"
      >
        Buy
      </a>
      <button
        type="button"
        onClick={() => navigate(`/shop?peptide=${encodeURIComponent(peptideSlug)}`)}
        className="text-[11px] font-semibold text-accent-600 active:opacity-70"
        title="View all sizes"
      >
        <i className="ri-arrow-right-s-line text-base" />
      </button>
    </div>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" strokeWidth="8" className="stroke-background-200" />
      <circle
        cx="48" cy="48" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (pct / 100) * circ}
        className={`transition-all duration-700 ${pct >= 80 ? "stroke-accent-500" : "stroke-primary-500"}`}
      />
    </svg>
  );
}

// ── Active cycle card ─────────────────────────────────────────────────────

function ActiveCard({
  p, onReview, onAbandon, onSchedule,
}: {
  p: Protocol;
  onReview: () => void;
  onAbandon: () => void;
  onSchedule: () => void;
}) {
  const pct  = getProgressPct(p);
  const days = getDaysRemaining(p);
  const soon = isExpiringSoon(p);
  const done = days === 0;
  const navigate = useNavigate();
  const hasSchedule = (p.doseTimes?.length ?? 0) > 0;

  return (
    <div className={`rounded-3xl border-2 bg-white p-5 shadow-sm transition-colors ${
      soon ? "border-accent-300" : "border-background-100"
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
            <VialIcon categorySlug={p.categorySlug} size={32} label={p.peptideName} sublabel={`${p.vialMg}mg`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-lg font-bold text-foreground-950 truncate">{p.peptideName}</p>
          <p className="text-sm text-foreground-500">
            {p.vialMg} mg · {p.doseMcg} mcg/dose · {p.dosesPerVial} doses
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`font-heading text-3xl font-bold leading-none ${
              soon ? "text-accent-600" : "text-primary-600"
            }`}>
              {done ? "✓" : days}
            </span>
            {!done && <span className="text-sm text-foreground-500">days left</span>}
          </div>
          <p className="mt-0.5 text-xs text-foreground-400">
            {formatDate(p.startedAt)} → {formatDate(p.endsAt)}
          </p>
        </div>
      </div>

      {/* Contextual reorder card when running low */}
      {soon && !done && <ReorderCard peptideSlug={p.peptideSlug} />}

      {/* Schedule indicator */}
      <button
        type="button"
        onClick={onSchedule}
        className="mt-4 flex w-full items-center gap-2.5 rounded-2xl border border-background-100 bg-background-50 px-4 py-2.5 text-left active:bg-background-100"
      >
        <i className={`text-base ${hasSchedule ? "ri-alarm-line text-primary-500" : "ri-alarm-line text-foreground-300"}`} />
        <div className="flex-1 min-w-0">
          {hasSchedule ? (
            <p className="text-sm font-medium text-foreground-800">
              {p.doseTimes!.map(formatTime).join(" · ")}
              {p.restPattern && p.restPattern !== "daily" && (
                <span className="ml-1.5 text-xs text-foreground-400">
                  {p.restPattern === "eod" ? "every other day" : p.restPattern === "5on2off" ? "5-on/2-off" : "custom"}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm text-foreground-400">Set dose reminders</p>
          )}
        </div>
        <i className="ri-pencil-line text-sm text-foreground-300" />
      </button>

      <div className="mt-3 flex gap-2">
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

// ── Past cycle card ───────────────────────────────────────────────────────

function PastCard({ p }: { p: Protocol }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-background-100 bg-white p-4">
      <VialIcon categorySlug={p.categorySlug} size={30} blank />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground-900 truncate">{p.peptideName}</p>
        <p className="text-xs text-foreground-400">
          {formatDate(p.startedAt)} → {formatDate(p.endsAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {p.reviewRating && (
          <span className="text-sm">{"⭐".repeat(p.reviewRating)}</span>
        )}
        {p.reviewWorked !== undefined && (
          <span className="text-xs text-foreground-400">
            {p.reviewWorked ? "👍 Worked" : "👎 Didn't work"}
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

// ── Page ──────────────────────────────────────────────────────────────────

export default function TrackerPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [reviewProtocol, setReviewProtocol] = useState<Protocol | null>(null);
  const [scheduleProtocol, setScheduleProtocol] = useState<Protocol | null>(null);
  const navigate = useNavigate();

  const reload = useCallback(() => setProtocols(getProtocols()), []);

  useEffect(() => {
    reload();
    const pending = getPendingReview();
    if (pending) setReviewProtocol(pending);
  }, [reload]);

  const active = protocols.filter((p) => p.status === "active");
  const past   = protocols.filter((p) => p.status !== "active");

  function handleAbandon(p: Protocol) {
    saveProtocol({ ...p, status: "abandoned" });
    reload();
  }

  return (
    <AppShell title="My Cycle">
      <div className="pt-4 space-y-4">

        {/* Today's dose checklist */}
        <TodaySection protocols={active} onRefresh={reload} />

        {/* Empty state */}
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
              onClick={() => navigate("/start")}
              className="mt-6 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.97]"
            >
              Open Calculator →
            </button>
          </div>
        )}

        {/* Active cycles */}
        {active.map((p) => (
          <ActiveCard
            key={p.id}
            p={p}
            onReview={() => setReviewProtocol(p)}
            onAbandon={() => handleAbandon(p)}
            onSchedule={() => setScheduleProtocol(p)}
          />
        ))}

        {/* New cycle button */}
        {active.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/start")}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-background-200 py-3.5 text-sm font-semibold text-foreground-500 active:bg-background-50 transition-colors"
          >
            <i className="ri-add-line text-base" /> New cycle
          </button>
        )}

        {/* Past cycles */}
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

      {scheduleProtocol && (
        <ScheduleSheet
          protocol={scheduleProtocol}
          onClose={() => {
            setScheduleProtocol(null);
            reload();
          }}
        />
      )}
    </AppShell>
  );
}

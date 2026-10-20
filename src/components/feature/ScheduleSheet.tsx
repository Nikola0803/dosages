import { useState } from "react";
import { type Protocol, saveProtocol } from "@/lib/protocol";

interface Props {
  protocol: Protocol;
  onClose: () => void;
}

const REST_OPTIONS = [
  { key: "daily",    label: "Every day",      sub: "No rest days" },
  { key: "eod",      label: "Every other day", sub: "Alternate days on/off" },
  { key: "5on2off",  label: "5 on / 2 off",   sub: "5 days on, 2 days rest" },
  { key: "custom",   label: "Custom",          sub: "Pick specific rest days" },
] as const;

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const PRESET_TIMES = [
  "06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00",
  "20:00","21:00","22:00","23:00",
];

export default function ScheduleSheet({ protocol, onClose }: Props) {
  const initTimes = protocol.doseTimes?.length ? protocol.doseTimes : ["08:00"];
  const [doseTimes, setDoseTimes]     = useState<string[]>(initTimes);
  const [restPattern, setRestPattern] = useState<Protocol["restPattern"]>(
    protocol.restPattern ?? "daily"
  );
  const [restWeekdays, setRestWeekdays] = useState<number[]>(
    protocol.restWeekdays ?? []
  );

  function setTime(i: number, val: string) {
    setDoseTimes((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  }

  function addSlot() {
    if (doseTimes.length >= 4) return;
    const last = doseTimes[doseTimes.length - 1] ?? "08:00";
    const [h] = last.split(":").map(Number);
    const next = String(Math.min(h + 4, 23)).padStart(2, "0") + ":00";
    setDoseTimes((prev) => [...prev, next]);
  }

  function removeSlot(i: number) {
    if (doseTimes.length <= 1) return;
    setDoseTimes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function toggleWeekday(d: number) {
    setRestWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function handleSave() {
    saveProtocol({
      ...protocol,
      doseTimes: doseTimes.slice().sort(),
      restPattern,
      restWeekdays: restPattern === "custom" ? restWeekdays : undefined,
    });
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl animate-fadeUp">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-background-200" />

        <h2 className="font-heading text-xl font-bold text-foreground-950">Dose schedule</h2>
        <p className="mt-1 text-sm text-foreground-500">Set when you take {protocol.peptideName}.</p>

        {/* Dose times */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">
            Dose times ({doseTimes.length}/day)
          </p>
          <div className="space-y-2">
            {doseTimes.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                  {i + 1}
                </div>
                <select
                  value={t}
                  onChange={(e) => setTime(i, e.target.value)}
                  className="flex-1 rounded-xl border border-background-200 bg-white px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none"
                >
                  {PRESET_TIMES.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
                {doseTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-400 active:bg-background-100"
                  >
                    <i className="ri-close-line text-base" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {doseTimes.length < 4 && (
            <button
              type="button"
              onClick={addSlot}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-600 active:opacity-70"
            >
              <i className="ri-add-line text-base" /> Add another dose time
            </button>
          )}
        </div>

        {/* Rest pattern */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">
            Rest day pattern
          </p>
          <div className="grid grid-cols-2 gap-2">
            {REST_OPTIONS.map((opt) => {
              const sel = restPattern === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRestPattern(opt.key)}
                  className={`flex flex-col rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.97] ${
                    sel
                      ? "border-primary-500 bg-primary-50"
                      : "border-background-200 bg-white"
                  }`}
                >
                  <span className={`text-sm font-semibold ${sel ? "text-primary-700" : "text-foreground-900"}`}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-[11px] text-foreground-500">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom weekday picker */}
        {restPattern === "custom" && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-400">
              Rest on these days
            </p>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((day, d) => {
                const active = restWeekdays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleWeekday(d)}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all active:scale-95 ${
                      active
                        ? "bg-accent-500 text-white"
                        : "bg-background-100 text-foreground-600"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-foreground-400">
              Tapped = rest day (no dose reminder)
            </p>
          </div>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="mt-6 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-sm active:scale-[0.98]"
        >
          Save schedule
        </button>
      </div>
    </>
  );
}

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { peptides } from "@/mocks/peptides";
import VialIcon from "@/components/feature/VialIcon";

// ── PWA detection ──────────────────────────────────────────────────────────
function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

// ── Data ───────────────────────────────────────────────────────────────────
const GOALS = [
  { key: "fat",       icon: "ri-fire-line",        label: "Lose Fat",     sub: "GLP-1s & metabolics"          },
  { key: "muscle",    icon: "ri-boxing-line",       label: "Build Muscle", sub: "GH peptides & growth factors" },
  { key: "recovery",  icon: "ri-heart-pulse-line",  label: "Recovery",     sub: "BPC-157, TB-500 & more"       },
  { key: "longevity", icon: "ri-hourglass-line",    label: "Longevity",    sub: "Bioregulators & peptides"     },
  { key: "cognitive", icon: "ri-brain-line",        label: "Cognitive",    sub: "Nootropic peptides"           },
  { key: "immune",    icon: "ri-shield-cross-line", label: "Immune",       sub: "Thymosin, LL-37 & more"       },
];

const GOAL_FILTERS: Record<string, string[]> = {
  fat:       ["metabolic"],
  muscle:    ["gh-secretagogue", "growth-factor"],
  recovery:  ["tissue-repair"],
  longevity: ["longevity", "mitochondrial"],
  cognitive: ["cognitive"],
  immune:    ["immune", "endocrine"],
};

type Benefit = { emoji: string; title: string; desc: string };
const GOAL_BENEFITS: Record<string, Benefit[]> = {
  fat: [
    { emoji: "🔥", title: "Natural appetite regulation", desc: "GLP-1 peptides signal the brain to reduce hunger without stimulants" },
    { emoji: "⚡", title: "Enhanced fat oxidation",      desc: "Specific peptides promote fat breakdown between meals and during activity" },
    { emoji: "💪", title: "Preserves lean mass",          desc: "Unlike caloric restriction alone, peptides help maintain muscle during fat loss" },
  ],
  muscle: [
    { emoji: "📈", title: "Amplifies GH pulses",     desc: "Secretagogues boost your natural growth hormone output at night" },
    { emoji: "🔧", title: "Faster protein synthesis", desc: "Growth factors signal muscle fibres to repair and grow after training" },
    { emoji: "⏱",  title: "Shorter recovery window",  desc: "Reduces the time between hard sessions by cutting inflammatory response" },
  ],
  recovery: [
    { emoji: "🩹", title: "Tendon & ligament repair",    desc: "BPC-157 accelerates healing of connective tissue at injury sites" },
    { emoji: "🛡",  title: "Reduces inflammation",       desc: "Systemic anti-inflammatory action helps acute and chronic injuries" },
    { emoji: "🧬", title: "Promotes collagen synthesis", desc: "TB-500 recruits stem cells and upregulates collagen at repair sites" },
  ],
  longevity: [
    { emoji: "⏳", title: "Telomere maintenance",    desc: "Epitalon shown to reset biological age markers in animal models" },
    { emoji: "🔋", title: "Mitochondrial renewal",   desc: "MOTS-c activates mitochondrial biogenesis and metabolic efficiency" },
    { emoji: "🧠", title: "Neurological senescence", desc: "Bioregulators modulate gene expression linked to ageing processes" },
  ],
  cognitive: [
    { emoji: "🧠", title: "Crosses the blood-brain barrier", desc: "Semax and Selank reach the brain rapidly after intranasal delivery" },
    { emoji: "🌱", title: "BDNF & neuroplasticity",           desc: "Boosts brain-derived neurotrophic factor and synaptic flexibility" },
    { emoji: "😌", title: "Anxiety modulation",               desc: "Selank shown to reduce anxiety markers in multiple clinical models" },
  ],
  immune: [
    { emoji: "🛡",  title: "T-cell development",   desc: "Thymosin alpha-1 accelerates thymus maturation and immune output" },
    { emoji: "🦠", title: "Antimicrobial action",  desc: "LL-37 is a broad-spectrum antimicrobial peptide from the cathelicidin family" },
    { emoji: "⚖️", title: "Autoimmune modulation", desc: "VIP and thymic peptides help balance overactive immune responses" },
  ],
};

const GENERIC_BENEFITS: Benefit[] = [
  { emoji: "🔬", title: "Reference data for 72+ peptides",  desc: "Researched dose ranges backed by clinical studies and protocols" },
  { emoji: "📊", title: "Reconstitution maths instantly",    desc: "Tells you exactly how much bacteriostatic water to add to your vial" },
  { emoji: "💉", title: "Exact syringe draw lines",          desc: "Visual gauge showing where to pull the plunger for your exact dose" },
];

const SOURCES = [
  { key: "instagram", icon: "ri-instagram-line",  label: "Instagram"        },
  { key: "tiktok",    icon: "ri-tiktok-line",      label: "TikTok"           },
  { key: "youtube",   icon: "ri-youtube-line",     label: "YouTube"          },
  { key: "google",    icon: "ri-google-line",      label: "Google / search"  },
  { key: "reddit",    icon: "ri-reddit-line",      label: "Reddit / forums"  },
  { key: "friend",    icon: "ri-user-heart-line",  label: "Friend or family" },
  { key: "other",     icon: "ri-more-line",        label: "Other"            },
];

const ACTIVITIES = [
  { key: "sedentary", label: "Sedentary",               sub: "Little to no exercise"        },
  { key: "light",     label: "Light (1–2×/week)",       sub: "Walking, occasional gym"      },
  { key: "moderate",  label: "Moderate (3–4×/week)",    sub: "Regular training"             },
  { key: "active",    label: "Very active (5–6×/week)", sub: "Daily training or sports"     },
  { key: "elite",     label: "Elite / Athlete",         sub: "2×/day, competition prep"     },
];

const AGE_VALUES = Array.from({ length: 63 }, (_, i) => 18 + i);  // 18–80
const HEIGHT_CM  = Array.from({ length: 81 }, (_, i) => 140 + i); // 140–220 cm
const HEIGHT_IN  = Array.from({ length: 33 }, (_, i) => 55 + i);  // 55–87 in (4'7"–7'3")

// ── Helpers ────────────────────────────────────────────────────────────────
function inToFtIn(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

async function submitEmail(payload: {
  email: string; goal: string; peptide: string; source: string;
  sex?: string; age?: number; weightKg?: number; heightCm?: number; activity?: string;
}) {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, email: payload.email.trim() }),
  });
  if (!res.ok) throw new Error("subscribe failed");
}

// ── DrumPicker ─────────────────────────────────────────────────────────────
function DrumPicker({
  values,
  value,
  onChange,
  formatFn,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  formatFn?: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM_H = 64;

  useEffect(() => {
    const idx = values.indexOf(value);
    if (idx >= 0 && ref.current) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    if (values[clamped] !== undefined && values[clamped] !== value) {
      onChange(values[clamped]);
    }
  }, [values, value, onChange]);

  return (
    <div className="relative mt-4 h-[320px] overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background-50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background-50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-6 top-[128px] h-16 rounded-2xl bg-background-100 z-[5]" />
      <div
        ref={ref}
        onScroll={handleScroll}
        style={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          paddingTop: 128,
          paddingBottom: 128,
          scrollbarWidth: "none",
        } as React.CSSProperties}
      >
        {values.map((v) => {
          const sel = v === value;
          return (
            <div
              key={v}
              onClick={() => onChange(v)}
              style={{ scrollSnapAlign: "center", height: ITEM_H }}
              className="flex items-center justify-center cursor-pointer"
            >
              <span className={`font-heading font-bold transition-all duration-100 ${
                sel ? "text-5xl text-foreground-950" : "text-2xl text-foreground-300"
              }`}>
                {formatFn ? formatFn(v) : v}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── UnitToggle ─────────────────────────────────────────────────────────────
function UnitToggle({ isMetric, onToggle }: { isMetric: boolean; onToggle: () => void }) {
  return (
    <div className="mx-auto mt-6 flex w-52 rounded-2xl bg-background-100 p-1">
      <button
        type="button"
        onClick={() => isMetric && onToggle()}
        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
          !isMetric ? "bg-white shadow-sm text-primary-700 border border-primary-200" : "text-foreground-400"
        }`}
      >
        Imperial
      </button>
      <button
        type="button"
        onClick={() => !isMetric && onToggle()}
        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
          isMetric ? "bg-white shadow-sm text-primary-700 border border-primary-200" : "text-foreground-400"
        }`}
      >
        Metric
      </button>
    </div>
  );
}

// ── Finish screen ──────────────────────────────────────────────────────────

function PrepScreen({
  goal, peptide, onFinish,
}: {
  goal: string | null; peptide?: string; onFinish: () => void;
}) {
  const goalMeta = GOALS.find(g => g.key === goal);

  // Read all profile data from localStorage
  const weightKg = (() => { try { return Number(localStorage.getItem("vc-weight-kg")) || null; } catch { return null; } })();
  const heightCm = (() => { try { return Number(localStorage.getItem("vc-height-cm")) || null; } catch { return null; } })();
  const age      = (() => { try { return Number(localStorage.getItem("vc-age")) || null; } catch { return null; } })();
  const sex      = (() => { try { return localStorage.getItem("vc-sex"); } catch { return null; } })();
  const activity = (() => { try { return localStorage.getItem("vc-activity"); } catch { return null; } })();

  // Compute BMI
  const bmi = (weightKg && heightCm) ? weightKg / Math.pow(heightCm / 100, 2) : null;
  const bmiCategory = !bmi ? "" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal range" : bmi < 30 ? "Overweight" : "Obese";

  // Compute TDEE via Harris-Benedict
  const bmr = (weightKg && heightCm && age)
    ? (sex === "female"
        ? 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age
        : 88.362  + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age)
    : null;
  const actMult: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, "very-active": 1.725, elite: 1.9,
  };
  const tdee = bmr ? Math.round(bmr * (actMult[activity ?? ""] ?? 1.375)) : null;

  // Peptide dose from peptides data
  const peptideData = peptides.find(p => p.name === peptide);
  const startDose = peptideData
    ? (weightKg && peptideData.perKgMcg ? Math.round(weightKg * peptideData.perKgMcg) : peptideData.typicalMcg)
    : null;

  type CalcRow = { computing: string; icon: string; label: string; value: string };
  const rows: CalcRow[] = [
    ...(weightKg || heightCm ? [{
      computing: "Reading body measurements…",
      icon: "ri-user-heart-line",
      label: "Body stats",
      value: [weightKg && `${weightKg} kg`, heightCm && `${heightCm} cm`].filter(Boolean).join(" · "),
    }] : []),
    ...(bmi ? [{
      computing: "Calculating BMI…",
      icon: "ri-scales-3-line",
      label: "BMI",
      value: `${bmi.toFixed(1)} — ${bmiCategory}`,
    }] : []),
    ...(tdee ? [{
      computing: "Estimating daily energy expenditure…",
      icon: "ri-fire-line",
      label: "Maintenance TDEE",
      value: `~${tdee.toLocaleString()} kcal / day`,
    }] : []),
    ...(goalMeta ? [{
      computing: "Mapping to your goal…",
      icon: goalMeta.icon,
      label: "Your goal",
      value: goalMeta.label,
    }] : []),
    ...(peptide && startDose && peptideData ? [{
      computing: `Calibrating ${peptide} protocol…`,
      icon: "ri-flask-fill",
      label: "Starting dose",
      value: `${startDose.toLocaleString()} mcg · ${peptideData.frequency}`,
    }] : []),
  ];

  // Row animation: "hidden" → "calculating" → "done"
  type RowState = "hidden" | "calculating" | "done";
  const [rowStates, setRowStates] = useState<RowState[]>(() => rows.map(() => "hidden"));
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const INTERVAL = 900;
    const CALC_DUR = 700;
    const timers: ReturnType<typeof setTimeout>[] = [];
    rows.forEach((_, i) => {
      timers.push(setTimeout(() => setRowStates(s => s.map((st, j) => j === i ? "calculating" : st)), 300 + i * INTERVAL));
      timers.push(setTimeout(() => setRowStates(s => s.map((st, j) => j === i ? "done" : st)), 300 + i * INTERVAL + CALC_DUR));
    });
    timers.push(setTimeout(() => setFinished(true), 300 + rows.length * INTERVAL + CALC_DUR + 500));
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col px-4 pt-8 pb-6">
      {/* Icon + heading */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-700 ${
          finished ? "bg-white shadow-2xl shadow-primary-900/40 scale-110" : "bg-white/10"
        }`}>
          <i className={`text-4xl transition-all duration-500 ${
            finished ? "ri-check-line text-primary-500" : "ri-loader-4-line text-white animate-spin"
          }`} />
        </div>
        <h1 className="mt-5 font-heading text-3xl font-bold text-white">
          {finished ? "You're all set!" : "Building your profile…"}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {finished ? "Your personalised protocol is ready to build." : "Crunching the numbers…"}
        </p>
      </div>

      {/* Calculation rows */}
      <div className="space-y-3">
        {rows.map((row, i) => {
          const state = rowStates[i];
          if (state === "hidden") return null;
          const isCalc = state === "calculating";
          return (
            <div
              key={row.label}
              className="flex items-center gap-3.5 rounded-2xl bg-white/8 px-4 py-4 animate-fadeUp"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                isCalc ? "bg-white/15" : "bg-primary-500"
              }`}>
                <i className={`text-lg transition-all duration-300 ${
                  isCalc ? "ri-loader-4-line text-white/60 animate-spin" : `${row.icon} text-white`
                }`} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{row.label}</p>
                {isCalc ? (
                  <p className="mt-0.5 text-sm text-white/40 italic">{row.computing}</p>
                ) : (
                  <p className="mt-0.5 text-sm font-bold text-white truncate animate-fadeUp">{row.value}</p>
                )}
              </div>
              {!isCalc && <i className="ri-check-line flex-shrink-0 text-primary-400 text-lg" />}
            </div>
          );
        })}
      </div>

      {/* CTA — appears after all rows resolve */}
      <div className={`mt-auto transition-all duration-500 ${finished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <button
          type="button"
          onClick={onFinish}
          className="mt-8 w-full rounded-full bg-white py-4 text-base font-bold text-primary-950 shadow-lg active:scale-[0.98] transition-transform"
        >
          Build my protocol →
        </button>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 13;

export default function WelcomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "1";

  // Navigation
  const [step, setStep] = useState(0);

  // Bio personalization
  const [sex, setSex]           = useState<"male" | "female" | "other" | null>(null);
  const [age, setAge]           = useState(28);
  const [isMetric, setIsMetric] = useState(true);
  const [weightRaw, setWeightRaw] = useState(80);  // kg if metric, lbs if imperial
  const [heightRaw, setHeightRaw] = useState(175); // cm if metric, inches if imperial
  const [activity, setActivity] = useState<string | null>(null);

  // Protocol
  const [goal, setGoal]               = useState<string | null>(null);
  const [peptideSlug, setPeptideSlug] = useState("");
  const [query, setQuery]             = useState("");

  // Attribution + comms
  const [source, setSource]       = useState<string | null>(null);
  const [email, setEmail]         = useState("");
  const [emailState, setEmailState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [notifState, setNotifState] = useState<"idle" | "granted" | "denied" | "unavailable">("idle");

  useEffect(() => {
    if (!preview && !isStandalone()) {
      navigate("/", { replace: true });
      return;
    }
    if (localStorage.getItem("vc-onboarded")) {
      navigate("/start", { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleUnit() {
    if (isMetric) {
      setWeightRaw(Math.round(weightRaw * 2.20462));
      setHeightRaw(Math.round(heightRaw / 2.54));
    } else {
      setWeightRaw(Math.round(weightRaw / 2.20462));
      setHeightRaw(Math.round(heightRaw * 2.54));
    }
    setIsMetric((m) => !m);
  }

  const weightKgStore = isMetric ? weightRaw : Math.round(weightRaw / 2.20462);
  const heightCmStore = isMetric ? heightRaw : Math.round(heightRaw * 2.54);

  const filteredPeptides = useMemo(() => {
    const cats = goal ? GOAL_FILTERS[goal] : null;
    let list = cats ? peptides.filter((p) => cats.includes(p.categorySlug)) : peptides;
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [goal, query]);

  const benefits        = goal ? (GOAL_BENEFITS[goal] ?? GENERIC_BENEFITS) : GENERIC_BENEFITS;
  const selectedPeptide = useMemo(() => peptides.find((p) => p.slug === peptideSlug), [peptideSlug]);

  const isDark       = step === 0 || step === 9 || step === TOTAL_STEPS;
  const progressFrac = step >= 1 && step <= 12 ? step / 12 : null;

  function handleNext() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }
  function handleBack() { if (step > 0)           setStep((s) => s - 1); }

  function handleHaveItNow() {
    try {
      if (goal)        localStorage.setItem("vc-goal",    goal);
      if (peptideSlug) localStorage.setItem("vc-peptide", peptideSlug);
    } catch { /* ignore */ }
    navigate("/start", { replace: true });
  }

  async function handleNotif() {
    if (!("Notification" in window)) { setNotifState("unavailable"); return; }
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotifState("granted");
        import("@/lib/push").then(async ({ subscribeToPush, savePushSubscription }) => {
          const sub = await subscribeToPush();
          if (sub) await savePushSubscription(sub, goal ?? "", peptideSlug);
        }).catch(() => {});
      } else {
        setNotifState("denied");
      }
    } catch { setNotifState("unavailable"); }
  }

  async function handleEmailSubmit() {
    if (!isValidEmail(email)) return;
    setEmailState("loading");
    try {
      await submitEmail({
        email,
        goal:     goal     ?? "",
        peptide:  peptideSlug,
        source:   source   ?? "",
        sex:      sex      ?? undefined,
        age,
        weightKg: weightKgStore,
        heightCm: heightCmStore,
        activity: activity ?? undefined,
      });
      setEmailState("success");
      setTimeout(() => setStep(TOTAL_STEPS), 800);
    } catch { setEmailState("error"); }
  }

  function handleFinish() {
    try {
      localStorage.setItem("vc-onboarded",  "1");
      if (goal)        localStorage.setItem("vc-goal",     goal);
      if (peptideSlug) localStorage.setItem("vc-peptide",  peptideSlug);
      if (source)      localStorage.setItem("vc-source",   source);
      if (sex)         localStorage.setItem("vc-sex",      sex);
      if (activity)    localStorage.setItem("vc-activity", activity);
      localStorage.setItem("vc-age",       String(age));
      localStorage.setItem("vc-weight-kg", String(weightKgStore));
      localStorage.setItem("vc-height-cm", String(heightCmStore));
    } catch { /* ignore */ }
    // Send to builder — pre-filled with goal + peptide from onboarding, opens at vial step
    navigate("/start", { replace: true });
  }

  const heightDrumValues = isMetric ? HEIGHT_CM : HEIGHT_IN;

  return (
    <div className={`relative flex min-h-screen flex-col ${isDark ? "bg-primary-950" : "bg-background-50"}`}>

      {/* Progress bar */}
      {progressFrac !== null && (
        <div className="fixed left-0 right-0 top-0 z-20 h-1 bg-black/[0.08]">
          <div
            className={`h-full transition-all duration-500 ${isDark ? "bg-white" : "bg-primary-500"}`}
            style={{ width: `${progressFrac * 100}%` }}
          />
        </div>
      )}

      {/* Back arrow */}
      {step > 0 && step < TOTAL_STEPS && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className={`absolute left-4 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            isDark ? "text-white/70 hover:bg-white/10" : "text-foreground-600 hover:bg-background-200"
          }`}
        >
          <i className="ri-arrow-left-s-line text-xl" />
        </button>
      )}

      {/* Screen content */}
      <div key={step} className="flex flex-1 flex-col animate-fadeUp px-6 pb-32 pt-14">

        {/* ══════════ STEP 0 — Splash ══════════ */}
        {step === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-500 shadow-lg shadow-primary-900/50">
              <span className="font-heading text-2xl font-bold text-white">VC</span>
            </div>
            <h1 className="font-heading text-5xl font-bold text-white">PeptideRatio</h1>
            <p className="mt-3 text-lg text-white/65">Your peptide protocol companion.</p>
            <div className="mt-5 flex items-center gap-1.5 text-sm text-white/40">
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.9 · 10,000+ researchers</span>
            </div>
            <div className="mt-auto pt-10 w-full">
              <button
                type="button"
                onClick={handleNext}
                className="w-full rounded-full bg-white py-4 text-base font-bold text-primary-950 shadow-lg transition-all active:scale-[0.98]"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="mt-4 w-full py-2 text-sm text-white/35 hover:text-white/60"
              >
                Already set up — skip to the calculator
              </button>
            </div>
          </div>
        )}

        {/* ══════════ STEP 1 — Goal ══════════ */}
        {step === 1 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-3xl font-bold text-foreground-950">What's your goal?</h1>
            <p className="mt-1.5 text-sm text-foreground-500">We'll suggest the right peptides for your use case.</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {GOALS.map((g) => {
                const selected = goal === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGoal(g.key)}
                    className={`flex flex-col rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.97] ${
                      selected
                        ? "border-primary-500 bg-primary-50 shadow-md shadow-primary-100"
                        : "border-background-200 bg-white shadow-sm hover:border-primary-200"
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
                      selected ? "bg-primary-500 text-white" : "bg-primary-100 text-primary-600"
                    }`}>
                      <i className={g.icon} />
                    </span>
                    <span className="mt-2 font-heading text-sm font-semibold text-foreground-950">{g.label}</span>
                    <span className="mt-0.5 text-[11px] leading-tight text-foreground-500">{g.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ STEP 2 — Sex ══════════ */}
        {step === 2 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-3xl font-bold text-foreground-950">I am…</h1>
            <p className="mt-2 text-sm text-foreground-500">
              Peptide dosing and hormonal interactions differ. This keeps your protocol accurate.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { key: "male",   icon: "ri-men-line",   label: "Male"   },
                { key: "female", icon: "ri-women-line", label: "Female" },
              ].map((opt) => {
                const sel = sex === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSex(opt.key as "male" | "female")}
                    className={`flex flex-col items-center gap-3 rounded-3xl border-2 py-9 transition-all active:scale-[0.97] ${
                      sel ? "border-primary-500 bg-primary-50" : "border-background-200 bg-white"
                    }`}
                  >
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      sel ? "bg-primary-500" : "bg-background-100"
                    }`}>
                      <i className={`${opt.icon} text-3xl ${sel ? "text-white" : "text-foreground-600"}`} />
                    </span>
                    <span className={`text-base font-bold ${sel ? "text-primary-700" : "text-foreground-900"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setSex("other")}
              className={`mt-3 w-full rounded-2xl border-2 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                sex === "other"
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-background-200 bg-white text-foreground-500"
              }`}
            >
              Prefer not to say
            </button>
          </div>
        )}

        {/* ══════════ STEP 3 — Age ══════════ */}
        {step === 3 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-3xl font-bold text-foreground-950">How old are you?</h1>
            <div className="mt-6 text-center">
              <p className="font-heading text-[80px] font-bold text-foreground-950 leading-none tabular-nums">{age}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-foreground-400">years old</p>
            </div>
            <DrumPicker values={AGE_VALUES} value={age} onChange={setAge} />
          </div>
        )}

        {/* ══════════ STEP 4 — Weight ══════════ */}
        {step === 4 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-3xl font-bold text-foreground-950">What's your weight?</h1>
            <UnitToggle isMetric={isMetric} onToggle={toggleUnit} />
            {/* Type-in input — big and tappable */}
            <div className="mt-6 flex items-end justify-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                min={isMetric ? 30 : 66}
                max={isMetric ? 300 : 660}
                value={weightRaw}
                onChange={(e) => {
                  const v = Math.round(Number(e.target.value));
                  if (!isNaN(v) && v > 0) setWeightRaw(v);
                }}
                className="w-40 border-b-2 border-primary-300 bg-transparent pb-1 text-center font-heading text-[72px] font-bold text-foreground-950 leading-none tabular-nums focus:border-primary-500 focus:outline-none"
              />
              <span className="mb-3 text-xl font-bold uppercase tracking-widest text-foreground-400">
                {isMetric ? "kg" : "lbs"}
              </span>
            </div>
            {/* Fine-tune buttons */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setWeightRaw((w) => Math.max(isMetric ? 30 : 66, w - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-2xl font-light text-foreground-700 transition-transform active:scale-[0.93]"
              >−</button>
              <span className="text-xs text-foreground-400">Fine-tune</span>
              <button
                type="button"
                onClick={() => setWeightRaw((w) => Math.min(isMetric ? 300 : 660, w + 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-2xl font-light text-foreground-700 transition-transform active:scale-[0.93]"
              >+</button>
            </div>
          </div>
        )}

        {/* ══════════ STEP 5 — Height ══════════ */}
        {step === 5 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-3xl font-bold text-foreground-950">What's your height?</h1>
            <div className="mt-6 text-center">
              <p className="font-heading text-[72px] font-bold text-foreground-950 leading-none tabular-nums">
                {isMetric ? heightRaw : inToFtIn(heightRaw)}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-foreground-400">
                {isMetric ? "cm" : "ft / in"}
              </p>
            </div>
            <UnitToggle isMetric={isMetric} onToggle={toggleUnit} />
            <DrumPicker
              key={isMetric ? "height-cm" : "height-in"}
              values={heightDrumValues}
              value={heightRaw}
              onChange={setHeightRaw}
              formatFn={isMetric ? undefined : inToFtIn}
            />
          </div>
        )}

        {/* ══════════ STEP 6 — Activity ══════════ */}
        {step === 6 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-3xl font-bold text-foreground-950">How active are you?</h1>
            <p className="mt-1.5 text-sm text-foreground-500">Helps calibrate your dosing schedule.</p>
            <div className="mt-6 space-y-2.5">
              {ACTIVITIES.map((a) => {
                const sel = activity === a.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setActivity(a.key)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                      sel
                        ? "border-primary-500 bg-primary-50"
                        : "border-background-200 bg-white hover:border-primary-200"
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-semibold ${sel ? "text-primary-800" : "text-foreground-950"}`}>{a.label}</p>
                      <p className={`mt-0.5 text-xs ${sel ? "text-primary-600" : "text-foreground-500"}`}>{a.sub}</p>
                    </div>
                    {sel && <i className="ri-check-line flex-shrink-0 text-primary-500 text-lg" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ STEP 7 — Peptide ══════════ */}
        {step === 7 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-4xl font-bold text-foreground-950">Which peptide?</h1>
            <p className="mt-2 text-base text-foreground-500">
              {goal ? "Showing peptides for your goal — or search all." : "Pick the one you're researching."}
            </p>
            <div className="relative mt-5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400">
                <i className="ri-search-line text-base" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search peptides…"
                className="w-full rounded-xl border border-background-300 bg-white py-3 pl-10 pr-4 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="mt-3 overflow-y-auto">
              {filteredPeptides.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredPeptides.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => setPeptideSlug(p.slug)}
                      className={`flex flex-col items-center rounded-2xl border-2 px-2 py-3 text-center transition-all active:scale-[0.96] ${
                        peptideSlug === p.slug
                          ? "border-primary-500 bg-primary-50 shadow-sm"
                          : "border-background-200 bg-white hover:border-primary-200"
                      }`}
                    >
                      <VialIcon categorySlug={p.categorySlug} size={36} />
                      <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-tight text-foreground-800">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-foreground-400">No peptides match that search.</p>
              )}
            </div>
          </div>
        )}

        {/* ══════════ STEP 8 — Have it in hand? ══════════ */}
        {step === 8 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-4xl font-bold text-foreground-950">
              Got {selectedPeptide?.name ?? "your peptide"} in hand?
            </h1>
            <p className="mt-2 text-base text-foreground-500">
              We'll calculate your exact draw line and dose right now.
            </p>
            <button
              type="button"
              onClick={handleHaveItNow}
              className="mt-8 flex w-full flex-col items-start gap-1.5 rounded-3xl border-2 border-primary-500 bg-primary-50 px-6 py-5 text-left shadow-md active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <i className="ri-flask-fill text-xl text-primary-500" />
                <span className="font-heading text-lg font-bold text-primary-900">Yes, I have it</span>
              </span>
              <span className="text-sm text-primary-700">Calculate my dose and draw line now →</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="mt-3 flex w-full flex-col items-start gap-1.5 rounded-3xl border-2 border-background-200 bg-white px-6 py-5 text-left active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <i className="ri-search-line text-xl text-foreground-400" />
                <span className="font-heading text-lg font-bold text-foreground-800">Not yet — still researching</span>
              </span>
              <span className="text-sm text-foreground-500">Continue building my profile</span>
            </button>
          </div>
        )}

        {/* ══════════ STEP 9 — Edu slide ══════════ */}
        {step === 9 && (
          <div className="flex flex-1 flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 mb-5">
              <i className={`${GOALS.find((g) => g.key === goal)?.icon ?? "ri-flask-line"} text-xl text-white`} />
            </div>
            <h1 className="font-heading text-4xl font-bold text-white">
              {selectedPeptide
                ? `What ${selectedPeptide.name} can do`
                : goal
                ? `${GOALS.find((g) => g.key === goal)?.label} peptides`
                : "What peptides can do"}
            </h1>
            <p className="mt-2 text-base text-white/60">Based on published research and user protocols.</p>
            <div className="mt-8 space-y-3">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex gap-4 rounded-2xl border-l-4 border-primary-400 bg-white/10 px-4 py-4 backdrop-blur-sm"
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="mt-0.5 text-sm text-white/65">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ STEP 10 — Attribution ══════════ */}
        {step === 10 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-4xl font-bold text-foreground-950">How did you find us?</h1>
            <p className="mt-2 text-base text-foreground-500">Helps us know where to share our work.</p>
            <div className="mt-6 space-y-2.5">
              {SOURCES.map((s) => {
                const selected = source === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSource(s.key)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                      selected
                        ? "border-primary-500 bg-primary-50 shadow-sm"
                        : "border-background-200 bg-white hover:border-primary-200"
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
                      selected ? "bg-primary-500 text-white" : "bg-background-100 text-foreground-600"
                    }`}>
                      <i className={s.icon} />
                    </span>
                    <span className="font-medium text-foreground-900">{s.label}</span>
                    {selected && <i className="ri-check-line ml-auto text-primary-500 text-lg" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ STEP 11 — Notifications ══════════ */}
        {step === 11 && (
          <div className="flex flex-1 flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 mb-5">
              <i className="ri-notification-3-line text-xl text-primary-600" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground-950">Never miss new research</h1>
            <p className="mt-2 text-base text-foreground-500">Turn on notifications to get:</p>
            <div className="mt-6 rounded-2xl border border-background-200 bg-white p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                  <span className="text-xs font-bold text-white">VC</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground-950">PeptideRatio</p>
                  <p className="text-[10px] text-foreground-400">now</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground-950">New research: BPC-157 oral bioavailability</p>
              <p className="mt-0.5 text-xs text-foreground-500">
                A 2025 study shows oral BPC-157 reaches systemic circulation at 28% of injectable levels…
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { icon: "ri-newspaper-line",   text: "New peptide research published"         },
                { icon: "ri-price-tag-3-line", text: "Supplier price drops & exclusive deals" },
                { icon: "ri-flask-line",        text: "Protocol updates for your peptides"    },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <i className={`${item.icon} text-sm`} />
                  </span>
                  <span className="text-sm text-foreground-700">{item.text}</span>
                </div>
              ))}
            </div>
            {notifState === "granted" && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
                <i className="ri-check-line text-base" /> Notifications turned on!
              </div>
            )}
            {notifState === "denied" && (
              <p className="mt-4 text-sm text-foreground-400">
                Notifications blocked. You can enable them in your browser settings later.
              </p>
            )}
          </div>
        )}

        {/* ══════════ STEP 12 — Email ══════════ */}
        {step === 12 && (
          <div className="flex flex-1 flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 mb-5">
              <i className="ri-gift-2-line text-xl text-accent-700" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground-950">Get exclusive deals</h1>
            <p className="mt-2 text-base text-foreground-500">
              Supplier discounts and new peptide alerts — members only. Free, always.
            </p>
            <div className="mt-8">
              <label className="mb-2 block text-sm font-semibold text-foreground-800">Your email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border-2 border-background-200 bg-white px-4 py-3.5 text-base text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              {emailState === "error" && (
                <p className="mt-1.5 text-sm text-red-500">Something went wrong — try again.</p>
              )}
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-foreground-400">
              <i className="ri-lock-line" />
              We only send things worth reading. No spam, ever.
            </p>
            {emailState === "success" && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
                <i className="ri-check-line" /> You're on the list!
              </div>
            )}
          </div>
        )}

        {/* ══════════ STEP 12 — Preparing ══════════ */}
        {step === TOTAL_STEPS && (
          <PrepScreen
            goal={goal}
            peptide={selectedPeptide?.name}
            onFinish={handleFinish}
          />
        )}

      </div>

      {/* ── Fixed bottom action bar ─────────────────────────────────────── */}
      {step !== 0 && step !== TOTAL_STEPS && (
        <div className={`fixed bottom-0 left-0 right-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 ${
          isDark
            ? "bg-gradient-to-t from-primary-950 via-primary-950/95 to-transparent"
            : "bg-gradient-to-t from-background-50 via-background-50/95 to-transparent"
        }`}>

          {/* Step 11: notification-specific buttons */}
          {step === 11 && (
            <>
              {notifState === "idle" ? (
                <button
                  type="button"
                  onClick={handleNotif}
                  className="w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98]"
                >
                  Turn On Notifications
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98]"
                >
                  Continue
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="mt-3 w-full py-2 text-sm text-foreground-400 hover:text-foreground-600"
              >
                Skip for now
              </button>
            </>
          )}

          {/* Step 12: email-specific buttons */}
          {step === 12 && emailState !== "success" && (
            <>
              <button
                type="button"
                onClick={handleEmailSubmit}
                disabled={!isValidEmail(email) || emailState === "loading"}
                className="w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:bg-background-300 disabled:text-foreground-400"
              >
                {emailState === "loading" ? "Saving…" : "Continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep(TOTAL_STEPS)}
                className="mt-3 w-full py-2 text-sm text-foreground-400 hover:text-foreground-600"
              >
                Skip for now
              </button>
            </>
          )}

          {/* All other middle steps */}
          {step !== 11 && step !== 12 && step !== 8 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !goal) ||
                (step === 2 && !sex)  ||
                (step === 6 && !activity) ||
                (step === 10 && !source)
              }
              className={`w-full rounded-full py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 ${
                isDark ? "bg-white text-primary-950" : "bg-primary-500 text-white"
              }`}
            >
              {step === 7 ? (peptideSlug ? "Continue" : "Skip — I'll decide later") : "Continue"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

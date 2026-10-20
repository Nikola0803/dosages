import { useState, useEffect, useMemo } from "react";
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
  { key: "fat",       icon: "ri-fire-line",        label: "Lose Fat",     sub: "GLP-1s & metabolics"         },
  { key: "muscle",    icon: "ri-boxing-line",       label: "Build Muscle", sub: "GH peptides & growth factors" },
  { key: "recovery",  icon: "ri-heart-pulse-line",  label: "Recovery",     sub: "BPC-157, TB-500 & more"      },
  { key: "longevity", icon: "ri-hourglass-line",    label: "Longevity",    sub: "Bioregulators & peptides"    },
  { key: "cognitive", icon: "ri-brain-line",        label: "Cognitive",    sub: "Nootropic peptides"          },
  { key: "immune",    icon: "ri-shield-cross-line", label: "Immune",       sub: "Thymosin, LL-37 & more"      },
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
    { emoji: "📈", title: "Amplifies GH pulses",    desc: "Secretagogues boost your natural growth hormone output at night" },
    { emoji: "🔧", title: "Faster protein synthesis", desc: "Growth factors signal muscle fibres to repair and grow after training" },
    { emoji: "⏱",  title: "Shorter recovery window", desc: "Reduces the time between hard sessions by cutting inflammatory response" },
  ],
  recovery: [
    { emoji: "🩹", title: "Tendon & ligament repair",  desc: "BPC-157 accelerates healing of connective tissue at injury sites" },
    { emoji: "🛡",  title: "Reduces inflammation",     desc: "Systemic anti-inflammatory action helps acute and chronic injuries" },
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
  { emoji: "🔬", title: "Reference data for 72+ peptides",   desc: "Researched dose ranges backed by clinical studies and protocols" },
  { emoji: "📊", title: "Reconstitution maths instantly",     desc: "Tells you exactly how much bacteriostatic water to add to your vial" },
  { emoji: "💉", title: "Exact syringe draw lines",           desc: "Visual gauge showing where to pull the plunger for your exact dose" },
];

const SOURCES = [
  { key: "instagram",  icon: "ri-instagram-line",      label: "Instagram"        },
  { key: "tiktok",     icon: "ri-tiktok-line",          label: "TikTok"           },
  { key: "youtube",    icon: "ri-youtube-line",         label: "YouTube"          },
  { key: "google",     icon: "ri-google-line",          label: "Google / search"  },
  { key: "reddit",     icon: "ri-reddit-line",          label: "Reddit / forums"  },
  { key: "friend",     icon: "ri-user-heart-line",      label: "Friend or family" },
  { key: "other",      icon: "ri-more-line",            label: "Other"            },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

async function submitEmail(email: string, goal: string, peptide: string, source: string) {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), goal, peptide, source }),
  });
  if (!res.ok) throw new Error("subscribe failed");
}

// ── Component ──────────────────────────────────────────────────────────────

const TOTAL_PROGRESS_STEPS = 6;

export default function WelcomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "1";

  const [step, setStep]       = useState(0);
  const [goal, setGoal]       = useState<string | null>(null);
  const [peptideSlug, setPeptideSlug] = useState("");
  const [query, setQuery]     = useState("");
  const [source, setSource]   = useState<string | null>(null);
  const [email, setEmail]     = useState("");
  const [emailState, setEmailState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [notifState, setNotifState] = useState<"idle" | "granted" | "denied" | "unavailable">("idle");

  // Gate: only for PWA (standalone) unless previewing
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

  const filteredPeptides = useMemo(() => {
    const cats = goal ? GOAL_FILTERS[goal] : null;
    let list = cats ? peptides.filter((p) => cats.includes(p.categorySlug)) : peptides;
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [goal, query]);

  const benefits = goal ? (GOAL_BENEFITS[goal] ?? GENERIC_BENEFITS) : GENERIC_BENEFITS;
  const selectedPeptide = useMemo(() => peptides.find((p) => p.slug === peptideSlug), [peptideSlug]);

  const progressFrac = step >= 1 && step <= 6 ? step / TOTAL_PROGRESS_STEPS : null;
  const isDark = step === 0 || step === 3 || step === 7;

  function handleNext() {
    if (step < 7) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleNotif() {
    if (!("Notification" in window)) {
      setNotifState("unavailable");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotifState("granted");
        // Subscribe to Web Push in the background
        import("@/lib/push").then(async ({ subscribeToPush, savePushSubscription }) => {
          const sub = await subscribeToPush();
          if (sub) await savePushSubscription(sub, goal ?? "", peptideSlug);
        }).catch(() => {});
      } else {
        setNotifState("denied");
      }
    } catch {
      setNotifState("unavailable");
    }
  }

  async function handleEmailSubmit() {
    if (!isValidEmail(email)) return;
    setEmailState("loading");
    try {
      await submitEmail(email, goal ?? "", peptideSlug, source ?? "");
      setEmailState("success");
      setTimeout(() => setStep(7), 800);
    } catch {
      setEmailState("error");
    }
  }

  function handleFinish() {
    try {
      localStorage.setItem("vc-onboarded", "1");
      if (goal)   localStorage.setItem("vc-goal", goal);
      if (source) localStorage.setItem("vc-source", source);
    } catch { /* ignore */ }
    navigate(peptideSlug ? `/start?peptide=${peptideSlug}` : "/start", { replace: true });
  }

  return (
    <div className={`relative flex min-h-screen flex-col ${isDark ? "bg-primary-950" : "bg-background-50"}`}>

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      {progressFrac !== null && (
        <div className="fixed left-0 right-0 top-0 z-20 h-1 bg-white/20">
          <div
            className={`h-full transition-all duration-500 ${isDark ? "bg-white" : "bg-primary-500"}`}
            style={{ width: `${progressFrac * 100}%` }}
          />
        </div>
      )}

      {/* ── Back button ──────────────────────────────────────────────── */}
      {step > 0 && step < 7 && (
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

      {/* ── Screen content (key triggers fade animation on step change) ── */}
      <div key={step} className="flex flex-1 flex-col animate-fadeUp px-6 pb-36 pt-16">

        {/* ══════════ STEP 0 — Splash ══════════ */}
        {step === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {/* Logo */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-500 shadow-lg shadow-primary-900/50">
              <span className="font-heading text-2xl font-bold text-white">VC</span>
            </div>

            <h1 className="font-heading text-5xl font-bold text-white">VialCalc</h1>
            <p className="mt-3 text-lg text-white/65">Your peptide reference companion.</p>

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
            <h1 className="font-heading text-4xl font-bold text-foreground-950">What's your goal?</h1>
            <p className="mt-2 text-base text-foreground-500">We'll suggest the right peptides for your use case.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {GOALS.map((g) => {
                const selected = goal === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGoal(g.key)}
                    className={`flex flex-col rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.97] ${
                      selected
                        ? "border-primary-500 bg-primary-50 shadow-md shadow-primary-100"
                        : "border-background-200 bg-white shadow-sm hover:border-primary-200"
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                      selected ? "bg-primary-500 text-white" : "bg-primary-100 text-primary-600"
                    }`}>
                      <i className={g.icon} />
                    </span>
                    <span className="mt-3 font-heading text-base font-semibold text-foreground-950">{g.label}</span>
                    <span className="mt-0.5 text-xs text-foreground-500">{g.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ STEP 2 — Peptide ══════════ */}
        {step === 2 && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-heading text-4xl font-bold text-foreground-950">Which peptide?</h1>
            <p className="mt-2 text-base text-foreground-500">
              {goal ? `Showing peptides for your goal — or search all.` : "Pick the one you're researching."}
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
                      <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-tight text-foreground-800">{p.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-foreground-400">No peptides match that search.</p>
              )}
            </div>
          </div>
        )}

        {/* ══════════ STEP 3 — Edu slide ══════════ */}
        {step === 3 && (
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

        {/* ══════════ STEP 4 — Attribution ══════════ */}
        {step === 4 && (
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

        {/* ══════════ STEP 5 — Notifications ══════════ */}
        {step === 5 && (
          <div className="flex flex-1 flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 mb-5">
              <i className="ri-notification-3-line text-xl text-primary-600" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground-950">Never miss new research</h1>
            <p className="mt-2 text-base text-foreground-500">Turn on notifications to get:</p>

            {/* Mock notification */}
            <div className="mt-6 rounded-2xl border border-background-200 bg-white p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                  <span className="text-xs font-bold text-white">VC</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground-950">VialCalc</p>
                  <p className="text-[10px] text-foreground-400">now</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground-950">New research: BPC-157 oral bioavailability</p>
              <p className="mt-0.5 text-xs text-foreground-500">A 2025 study shows oral BPC-157 reaches systemic circulation at 28% of injectable levels…</p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { icon: "ri-newspaper-line",   text: "New peptide research published" },
                { icon: "ri-price-tag-3-line", text: "Supplier price drops & exclusive deals" },
                { icon: "ri-flask-line",        text: "Protocol updates for your peptides" },
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
              <p className="mt-4 text-sm text-foreground-400">Notifications blocked. You can enable them in your browser settings later.</p>
            )}
          </div>
        )}

        {/* ══════════ STEP 6 — Email ══════════ */}
        {step === 6 && (
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

        {/* ══════════ STEP 7 — Done ══════════ */}
        {step === 7 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg shadow-primary-900/30">
              <i className="ri-check-line text-4xl text-primary-500" />
            </div>
            <h1 className="font-heading text-5xl font-bold text-white">You're all set!</h1>
            <p className="mt-3 text-lg text-white/65">
              VialCalc is ready.{selectedPeptide ? ` ${selectedPeptide.name} is pre-loaded.` : ""}
            </p>

            <div className="mt-auto pt-10 w-full">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full rounded-full bg-white py-4 text-base font-bold text-primary-950 shadow-lg transition-all active:scale-[0.98]"
              >
                Open the Calculator →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed bottom action buttons ──────────────────────────────── */}
      {step !== 0 && step !== 7 && (
        <div className={`fixed bottom-0 left-0 right-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 ${
          isDark
            ? "bg-gradient-to-t from-primary-950 via-primary-950/95 to-transparent"
            : "bg-gradient-to-t from-background-50 via-background-50/95 to-transparent"
        }`}>

          {/* Step 5: notification-specific buttons */}
          {step === 5 && (
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
                className={`mt-3 w-full py-2 text-sm ${isDark ? "text-white/40" : "text-foreground-400"} hover:text-foreground-600`}
              >
                Skip for now
              </button>
            </>
          )}

          {/* Step 6: email-specific buttons */}
          {step === 6 && emailState !== "success" && (
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
                onClick={() => setStep(7)}
                className="mt-3 w-full py-2 text-sm text-foreground-400 hover:text-foreground-600"
              >
                Skip for now
              </button>
            </>
          )}

          {/* All other middle steps */}
          {step !== 5 && step !== 6 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !goal) ||
                (step === 4 && !source)
              }
              className={`w-full rounded-full py-4 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 ${
                isDark
                  ? "bg-white text-primary-950"
                  : "bg-primary-500 text-white"
              }`}
            >
              {step === 2 ? (peptideSlug ? "Continue" : "Skip — I'll decide later") : "Continue"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

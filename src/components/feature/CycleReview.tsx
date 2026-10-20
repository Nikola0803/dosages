import { useState } from "react";
import { type Protocol, saveProtocol } from "@/lib/protocol";

interface Props {
  protocol: Protocol;
  onClose: () => void;
}

export default function CycleReview({ protocol, onClose }: Props) {
  const [rating, setRating]     = useState<number | null>(null);
  const [worked, setWorked]     = useState<boolean | null>(null);
  const [notes, setNotes]       = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    const updated: Protocol = {
      ...protocol,
      status: "complete",
      reviewSubmitted: true,
      reviewRating: rating ?? undefined,
      reviewWorked: worked ?? undefined,
      reviewNotes: notes.trim() || undefined,
    };
    saveProtocol(updated);
    setSubmitted(true);
    setTimeout(onClose, 1800);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl animate-fadeUp">
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-background-200" />

        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <i className="ri-check-line text-3xl text-primary-600" />
            </div>
            <p className="font-heading text-xl font-bold text-foreground-950">Thanks for the feedback!</p>
            <p className="mt-1 text-sm text-foreground-500">It helps us improve the app for everyone.</p>
          </div>
        ) : (
          <>
            <p className="font-heading text-2xl font-bold text-foreground-950">
              Cycle complete! 🎉
            </p>
            <p className="mt-1 text-sm text-foreground-500">
              Your {protocol.peptideName} cycle has ended. How did it go?
            </p>

            {/* Star rating */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-foreground-800">Overall rating</p>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`text-3xl transition-transform active:scale-90 ${
                      rating !== null && n <= rating ? "opacity-100" : "opacity-30"
                    }`}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Did it work */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-foreground-800">Did it work for you?</p>
              <div className="flex gap-3">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setWorked(val)}
                    className={`flex-1 rounded-2xl border-2 py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
                      worked === val
                        ? val
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-red-400 bg-red-50 text-red-700"
                        : "border-background-200 text-foreground-700"
                    }`}
                  >
                    {val ? "👍  Yes, it worked!" : "👎  Not really"}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-foreground-800">Any notes? <span className="font-normal text-foreground-400">(optional)</span></p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Side effects, dosing schedule, where you got it…"
                rows={3}
                className="w-full resize-none rounded-xl border-2 border-background-200 bg-background-50 p-3 text-sm text-foreground-900 focus:border-primary-300 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === null && worked === null}
              className="mt-5 w-full rounded-full bg-primary-500 py-4 text-base font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:bg-background-300 disabled:text-foreground-400"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full py-2 text-sm text-foreground-400"
            >
              Remind me later
            </button>
          </>
        )}
      </div>
    </>
  );
}

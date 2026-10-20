import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "vc-install-dismissed";

function isIosSafari() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      const ts = localStorage.getItem(DISMISSED_KEY);
      if (ts && Date.now() - Number(ts) < 7 * 24 * 60 * 60 * 1000) return;
    } catch { /* ignore */ }

    if (isIosSafari()) {
      setIosMode(true);
      setTimeout(() => setVisible(true), 4000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handler = () => setVisible(false);
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    } else {
      setInstalling(false);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch { /* ignore */ }
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install VialCalc"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm sm:pb-3"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-primary-700 bg-primary-950 px-4 py-3.5 shadow-2xl backdrop-blur-md">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-lg font-bold text-white shadow-inner">
          VC
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Add to your phone</p>
          {iosMode ? (
            <p className="mt-0.5 text-xs text-primary-300">
              Tap <strong className="text-primary-200">Share ↑</strong> then{" "}
              <strong className="text-primary-200">Add to Home Screen</strong>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-primary-300">
              Open VialCalc instantly. No app store needed.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {iosMode ? (
            <i className="ri-share-forward-line text-xl text-primary-400" />
          ) : (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="whitespace-nowrap rounded-lg bg-primary-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-60"
            >
              {installing ? "Installing…" : "Install"}
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[10px] text-primary-400 hover:text-primary-200"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

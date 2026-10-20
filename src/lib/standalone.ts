export function isStandalone(): boolean {
  if (import.meta.env.DEV && new URLSearchParams(location.search).has("standalone")) return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

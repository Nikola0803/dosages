export function isStandalone(): boolean {
  const params = new URLSearchParams(location.search);
  // ?preview=1 or ?standalone forces app mode (for testing / shareable demos)
  if (params.has("preview") || params.has("standalone")) return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

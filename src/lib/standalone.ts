export function isStandalone(): boolean {
  const params = new URLSearchParams(location.search);
  // ?preview=1 or ?standalone forces app mode — persist so it survives navigation
  if (params.has("preview") || params.has("standalone")) {
    try { sessionStorage.setItem("vc-preview", "1"); } catch { /* ignore */ }
    return true;
  }
  try { if (sessionStorage.getItem("vc-preview")) return true; } catch { /* ignore */ }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem('vc-device-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('vc-device-id', id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) return null;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  } catch (err) {
    console.error('[push] subscribe failed:', err);
    return null;
  }
}

export async function savePushSubscription(
  sub: PushSubscription,
  goal = '',
  peptide = '',
): Promise<void> {
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  try { localStorage.setItem('vc-push-sub', JSON.stringify(json)); } catch { /* ignore */ }

  // Sync to Supabase when available
  try {
    const { supabase } = await import('./supabase');
    if (!supabase) return;
    await supabase.from('push_subscriptions').upsert(
      { device_id: getDeviceId(), endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, goal, peptide },
      { onConflict: 'endpoint' }
    );
  } catch { /* Supabase not configured yet */ }
}

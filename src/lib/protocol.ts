export interface Protocol {
  id: string;
  peptideSlug: string;
  peptideName: string;
  categorySlug: string;
  vialMg: number;
  doseMcg: number;
  dosesPerVial: number;
  startedAt: string;   // YYYY-MM-DD
  endsAt: string;      // YYYY-MM-DD
  status: 'active' | 'complete' | 'abandoned';
  reviewSubmitted: boolean;
  reviewRating?: number;       // 1-5
  reviewWorked?: boolean;
  reviewNotes?: string;
}

const STORAGE_KEY = 'vc-protocols';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getProtocols(): Protocol[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

export function saveProtocol(p: Protocol): void {
  const all = getProtocols();
  const idx = all.findIndex((x) => x.id === p.id);
  if (idx >= 0) all[idx] = p; else all.unshift(p);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* ignore */ }

  // Mirror to Supabase async (fire-and-forget)
  import('./supabase').then(({ supabase }) => {
    if (!supabase) return;
    import('./push').then(({ getDeviceId }) => {
      supabase.from('protocols').upsert({ ...p, device_id: getDeviceId() }, { onConflict: 'id' }).then(() => {});
    });
  }).catch(() => {});
}

export function createProtocol(
  peptideSlug: string,
  peptideName: string,
  categorySlug: string,
  vialMg: number,
  doseMcg: number,
  dosesPerVial: number,
  startDate?: string,
): Protocol {
  const startedAt = startDate ?? today();
  const endsAt    = addDays(startedAt, dosesPerVial);

  return {
    id: crypto.randomUUID(),
    peptideSlug, peptideName, categorySlug,
    vialMg, doseMcg, dosesPerVial,
    startedAt, endsAt,
    status: 'active',
    reviewSubmitted: false,
  };
}

export function getDaysRemaining(p: Protocol): number {
  const ms = new Date(p.endsAt + 'T00:00:00').getTime() - new Date(today() + 'T00:00:00').getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function getProgressPct(p: Protocol): number {
  const start = new Date(p.startedAt + 'T00:00:00').getTime();
  const end   = new Date(p.endsAt   + 'T00:00:00').getTime();
  const now   = Date.now();
  if (end <= start) return 100;
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

export function isExpiringSoon(p: Protocol): boolean {
  return getDaysRemaining(p) <= Math.max(3, Math.ceil(p.dosesPerVial * 0.15));
}

export function getActiveProtocol(): Protocol | null {
  return getProtocols().find((p) => p.status === 'active') ?? null;
}

export function getPendingReview(): Protocol | null {
  return getProtocols().find(
    (p) => p.status === 'active' && getDaysRemaining(p) === 0 && !p.reviewSubmitted
  ) ?? null;
}

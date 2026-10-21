export interface DoseLog {
  id: string;
  protocolId: string;
  date: string;       // YYYY-MM-DD
  slotIndex: number;  // index into doseTimes
  takenAt: string;    // ISO timestamp
  notes?: string;
}

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
  reviewRating?: number;
  reviewWorked?: boolean;
  reviewNotes?: string;
  // schedule
  doseTimes?: string[];                           // ["08:00", "20:00"]
  restPattern?: 'daily' | 'eod' | '5on2off' | 'custom';
  restWeekdays?: number[];                        // 0=Sun … 6=Sat, rest days for 'custom'
  // reconstitution
  waterMl?: number;
  // cycle notes
  cycleNotes?: string;
  // supply tracking
  vialsOnHand?: number;   // total vials the user currently has (including the active one)
}

const STORAGE_KEY    = 'vc-protocols';
const DOSE_LOG_KEY   = 'vc-dose-log';

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

// ── Schedule helpers ───────────────────────────────────────────────────────

export function isRestDay(p: Protocol, dateStr: string): boolean {
  if (!p.restPattern || p.restPattern === 'daily') return false;
  const start = new Date(p.startedAt + 'T00:00:00').getTime();
  const check = new Date(dateStr    + 'T00:00:00').getTime();
  const day   = Math.round((check - start) / 86_400_000);
  if (p.restPattern === 'eod')     return day % 2 === 1;
  if (p.restPattern === '5on2off') return day % 7 >= 5;
  if (p.restPattern === 'custom' && p.restWeekdays?.length) {
    return p.restWeekdays.includes(new Date(dateStr + 'T00:00:00').getDay());
  }
  return false;
}

export function getTodaysSlots(p: Protocol, dateStr: string): string[] {
  if (!p.doseTimes?.length) return [];
  if (isRestDay(p, dateStr)) return [];
  return p.doseTimes;
}

// ── Dose log ──────────────────────────────────────────────────────────────

export function getDoseLog(): DoseLog[] {
  try { return JSON.parse(localStorage.getItem(DOSE_LOG_KEY) ?? '[]'); }
  catch { return []; }
}

export function logDose(protocolId: string, slotIndex: number, notes?: string): DoseLog {
  const entry: DoseLog = {
    id: crypto.randomUUID(),
    protocolId,
    date: today(),
    slotIndex,
    takenAt: new Date().toISOString(),
    notes,
  };
  const all = getDoseLog();
  all.unshift(entry);
  try { localStorage.setItem(DOSE_LOG_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  return entry;
}

export function removeDoseLog(id: string): void {
  const filtered = getDoseLog().filter((d) => d.id !== id);
  try { localStorage.setItem(DOSE_LOG_KEY, JSON.stringify(filtered)); } catch { /* ignore */ }
}

export function getTodaysLogForProtocol(protocolId: string): DoseLog[] {
  const t = today();
  return getDoseLog().filter((d) => d.protocolId === protocolId && d.date === t);
}

/**
 * Vercel cron — sends dose-time push notifications.
 * Runs every hour: { "path": "/api/dose-alarm", "schedule": "0 * * * *" }
 *
 * Reads each device's active protocol schedule from Supabase and sends a
 * push notification when the current UTC hour matches any of their dose times.
 * Requires the dose_times and rest_pattern columns in the protocols table.
 */
import webpush from "web-push";

// Simple rest-day check mirrored from src/lib/protocol.ts
function isRestDay(
  startedAt: string,
  restPattern: string | null,
  restWeekdays: number[] | null,
  dateStr: string,
): boolean {
  if (!restPattern || restPattern === "daily") return false;
  const start = new Date(startedAt + "T00:00:00Z").getTime();
  const check = new Date(dateStr   + "T00:00:00Z").getTime();
  const day   = Math.round((check - start) / 86_400_000);
  if (restPattern === "eod")     return day % 2 === 1;
  if (restPattern === "5on2off") return day % 7 >= 5;
  if (restPattern === "custom" && restWeekdays?.length) {
    return restWeekdays.includes(new Date(dateStr + "T00:00:00Z").getDay());
  }
  return false;
}

export default async function handler(
  req: { method?: string },
  res: { status: (n: number) => { json: (d: unknown) => void } }
) {
  const supabaseUrl  = process.env.VITE_SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPub     = process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPriv    = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;

  if (!supabaseUrl || !serviceKey || !vapidPub || !vapidPriv || !vapidSubject) {
    return res.status(200).json({ ok: false, reason: "missing env vars" });
  }

  webpush.setVapidDetails(vapidSubject, vapidPub, vapidPriv);

  const now        = new Date();
  const today      = now.toISOString().split("T")[0];
  const currentHHMM = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
  // Match dose times within a ±4-minute window of the current time
  const [nowH, nowM] = currentHHMM.split(":").map(Number);
  const nowMinutes = nowH * 60 + nowM;

  const sbRes = await fetch(
    `${supabaseUrl}/rest/v1/protocols` +
    `?select=id,peptide_name,dose_times,rest_pattern,rest_weekdays,started_at,device_id,push_subscriptions(endpoint,p256dh,auth)` +
    `&status=eq.active`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!sbRes.ok) {
    return res.status(200).json({ ok: false, reason: "supabase query failed" });
  }

  const protocols = (await sbRes.json()) as Array<{
    id: string;
    peptide_name: string;
    dose_times: string[] | null;
    rest_pattern: string | null;
    rest_weekdays: number[] | null;
    started_at: string;
    device_id: string;
    push_subscriptions?: { endpoint: string; p256dh: string; auth: string };
  }>;

  let sent = 0;
  for (const p of protocols) {
    const sub = p.push_subscriptions;
    if (!sub || !p.dose_times?.length) continue;
    if (isRestDay(p.started_at, p.rest_pattern, p.rest_weekdays, today)) continue;

    // Find any dose time within ±4 minutes of now
    const matchingSlot = p.dose_times.find((t) => {
      const [h, m] = t.split(":").map(Number);
      const slotMin = h * 60 + m;
      return Math.abs(slotMin - nowMinutes) <= 4;
    });
    if (!matchingSlot) continue;

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: `Time for your ${p.peptide_name}`,
          body: `Dose scheduled at ${matchingSlot}. Tap to log it in your tracker.`,
          tag: `dose-${p.id}-${matchingSlot}`,
          url: "/tracker",
        })
      );
      sent++;
    } catch (err) {
      console.error(`dose-alarm: failed for protocol ${p.id}:`, err);
    }
  }

  return res.status(200).json({ ok: true, sent, checked: protocols.length });
}

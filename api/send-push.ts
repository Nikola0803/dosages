/**
 * Vercel cron-compatible endpoint that sends renewal push notifications.
 *
 * Add to vercel.json crons once Supabase is configured:
 *   { "path": "/api/send-push", "schedule": "0 9 * * *" }
 *
 * Required env vars (Vercel dashboard):
 *   VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   VAPID_SUBJECT, VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 */
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

  // Build today's date string
  const today = new Date().toISOString().split("T")[0];

  // Query Supabase for protocols where notify_at <= today and push subscription exists
  const sbRes = await fetch(
    `${supabaseUrl}/rest/v1/protocols?select=*,push_subscriptions(endpoint,p256dh,auth)&status=eq.active&notify_at=lte.${today}&notified=eq.false`,
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
    id: string; peptide_slug: string; doses_per_vial: number;
    push_subscriptions?: { endpoint: string; p256dh: string; auth: string };
  }>;

  let sent = 0;
  for (const p of protocols) {
    const sub = p.push_subscriptions;
    if (!sub) continue;

    // Use web-push style VAPID auth manually (simplified — install web-push for production)
    try {
      const payload = JSON.stringify({
        title: "VialCalc — Reorder reminder",
        body: `Your peptide cycle is almost done. Time to check your next vial!`,
        tag: `renew-${p.id}`,
        url: "/tracker",
      });

      await fetch(sub.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Encoding": "aes128gcm",
          // In production, replace this with proper VAPID JWT + encrypted payload
          // using the 'web-push' npm package: webpush.sendNotification(sub, payload)
          Authorization: `vapid t=placeholder,k=${vapidPub}`,
        },
        body: payload,
      });
      sent++;

      // Mark as notified
      await fetch(`${supabaseUrl}/rest/v1/protocols?id=eq.${p.id}`, {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ notified: true }),
      });
    } catch (err) {
      console.error(`Failed to notify protocol ${p.id}:`, err);
    }
  }

  return res.status(200).json({ ok: true, sent });
}

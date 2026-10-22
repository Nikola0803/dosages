/**
 * Vercel cron endpoint — sends renewal push notifications daily at 09:00 UTC.
 * Registered in vercel.json: { "path": "/api/send-push", "schedule": "0 9 * * *" }
 *
 * Required Vercel env vars:
 *   VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   VAPID_SUBJECT, VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 */
import webpush from "web-push";

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

  const today = new Date().toISOString().split("T")[0];

  // Fetch protocols due for notification, joined with their push subscription
  const sbRes = await fetch(
    `${supabaseUrl}/rest/v1/protocols` +
    `?select=id,peptide_name,doses_per_vial,device_id,push_subscriptions(endpoint,p256dh,auth)` +
    `&status=eq.active&notify_at=lte.${today}&notified=eq.false`,
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
    doses_per_vial: number;
    device_id: string;
    push_subscriptions?: { endpoint: string; p256dh: string; auth: string };
  }>;

  let sent = 0;
  for (const p of protocols) {
    const sub = p.push_subscriptions;
    if (!sub) continue;

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: "PeptideRatio — Reorder reminder",
          body: `Your ${p.peptide_name} cycle is almost done. Time to check your next vial!`,
          tag: `renew-${p.id}`,
          url: "/tracker",
        })
      );
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

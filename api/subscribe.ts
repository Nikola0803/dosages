export default async function handler(
  req: {
    method?: string;
    body?: {
      email?: string;
      goal?: string;
      peptide?: string;
      source?: string;
      sex?: string;
      age?: number;
      weightKg?: number;
      heightCm?: number;
      activity?: string;
    };
  },
  res: { status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email = "" } = req.body ?? {};

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const crmUrl = process.env.CRM_API_URL;
  const crmKey = process.env.CRM_API_KEY;

  // If CRM env vars aren't configured yet, silently succeed so onboarding isn't blocked
  if (!crmUrl || !crmKey) {
    return res.status(200).json({ ok: true });
  }

  try {
    const r = await fetch(`${crmUrl}/api/store/newsletter`, {
      method: "POST",
      headers: {
        "x-store-domain": "peptideratio.com",
        "x-store-api-key": crmKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("CRM newsletter error", r.status, txt);
    }

    // Always succeed — never block onboarding on email issues
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("subscribe handler error:", err);
    return res.status(200).json({ ok: true });
  }
}

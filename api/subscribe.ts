export default async function handler(
  req: { method?: string; body?: { email?: string; goal?: string; peptide?: string; source?: string } },
  res: { status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email = "", goal = "", peptide = "", source = "" } = req.body ?? {};

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const apiKey    = process.env.RESEND_API_KEY;
  const audience  = process.env.RESEND_AUDIENCE_ID;

  // If env vars aren't configured yet, silently succeed so onboarding isn't blocked
  if (!apiKey || !audience) {
    return res.status(200).json({ ok: true });
  }

  try {
    const r = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        unsubscribed: false,
        first_name: "",
        // custom attributes visible in Resend dashboard
        last_name: [goal, peptide, source].filter(Boolean).join(" | "),
      }),
    });

    if (!r.ok) {
      // Duplicate contact returns 409 — treat as success
      if (r.status === 409) return res.status(200).json({ ok: true });
      const txt = await r.text();
      console.error("Resend error", r.status, txt);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("subscribe handler error:", err);
    // Silently succeed — never block onboarding on email issues
    return res.status(200).json({ ok: true });
  }
}

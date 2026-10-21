export default async function handler(
  req: {
    method?: string;
    body?: {
      email?: string;
      goal?: string;
      peptide?: string;
      source?: string;
      // bio personalization fields from onboarding
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

  const {
    email = "",
    goal = "",
    peptide = "",
    source = "",
    sex,
    age,
    weightKg,
    heightCm,
    activity,
  } = req.body ?? {};

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const apiKey   = process.env.RESEND_API_KEY;
  const audience = process.env.RESEND_AUDIENCE_ID;

  // If env vars aren't configured yet, silently succeed so onboarding isn't blocked
  if (!apiKey || !audience) {
    return res.status(200).json({ ok: true });
  }

  // Encode all metadata into Resend's last_name field (pipe-separated)
  // Format: goal | peptide | source | sex | age | weightKg kg | heightCm cm | activity
  const meta = [
    goal,
    peptide,
    source,
    sex     ? `sex:${sex}`          : null,
    age     ? `age:${age}`          : null,
    weightKg ? `wt:${weightKg}kg`   : null,
    heightCm ? `ht:${heightCm}cm`   : null,
    activity ? `activity:${activity}` : null,
  ].filter(Boolean).join(" | ");

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
        last_name: meta,
      }),
    });

    if (!r.ok) {
      // Duplicate contact (409) — try to update with latest bio data
      if (r.status === 409) {
        // PATCH to update existing contact's metadata
        await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim(), last_name: meta }),
        }).catch(() => {});
        return res.status(200).json({ ok: true });
      }
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

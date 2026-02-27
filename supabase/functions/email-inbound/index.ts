// supabase/functions/email-inbound/index.ts
// Receives Resend inbound webhook and forwards to personal email.
//
// Required env vars (set via: supabase secrets set KEY=value):
//   RESEND_API_KEY         — your Resend API key
//   RESEND_WEBHOOK_SECRET  — signing secret from Resend → Webhooks → Signing Secret
//   FORWARD_TO_EMAIL       — your personal email (e.g. miirsadra@gmail.com)

const RESEND_API = "https://api.resend.com/emails";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signingSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  const apiKey        = Deno.env.get("RESEND_API_KEY");
  const forwardTo     = Deno.env.get("FORWARD_TO_EMAIL");

  if (!apiKey || !forwardTo) {
    return new Response("Missing configuration", { status: 500 });
  }

  // --- Signature verification (Resend uses Svix) ---
  if (signingSecret) {
    const svixId        = req.headers.get("svix-id")        ?? "";
    const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
    const svixSig       = req.headers.get("svix-signature") ?? "";

    if (!svixId || !svixTimestamp || !svixSig) {
      return new Response("Missing webhook signature headers", { status: 401 });
    }

    const body      = await req.text();
    const toSign    = `${svixId}.${svixTimestamp}.${body}`;
    const secretBytes = Uint8Array.from(
      atob(signingSecret.replace(/^whsec_/, "")),
      (c) => c.charCodeAt(0)
    );
    const key    = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(toSign));
    const computed = "v1," + btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

    const valid = svixSig.split(" ").some((s) => s === computed);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }

    // Parse body we already read
    const payload = JSON.parse(body);
    return await forward(payload, apiKey, forwardTo);
  }

  // No signing secret configured — proceed without verification (not recommended for production)
  const payload = await req.json();
  return await forward(payload, apiKey, forwardTo);
});

async function forward(
  payload: Record<string, unknown>,
  apiKey: string,
  forwardTo: string
): Promise<Response> {
  // Resend inbound payload shape: { type, created_at, data: { from, to, subject, html, text } }
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const from    = (data.from    as string) ?? "unknown";
  const subject = (data.subject as string) ?? "(no subject)";
  const html    = (data.html    as string) ?? "";
  const text    = (data.text    as string) ?? "";

  const body = html ||
    `<pre style="font-family:sans-serif;white-space:pre-wrap">${text}</pre>`;

  const response = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from:     "Proof Inbox <hello@proofapp.site>",
      to:       [forwardTo],
      reply_to: [from],
      subject:  `Fwd: ${subject}`,
      html:     `
        <div style="font-family:sans-serif;font-size:14px;color:#333">
          <p style="color:#888;font-size:12px;margin-bottom:16px">
            Forwarded from <strong>${from}</strong> → hello@proofapp.site
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin-bottom:16px">
          ${body}
        </div>`,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Resend forward error:", err);
    return new Response("Failed to forward", { status: 502 });
  }

  return new Response(JSON.stringify({ forwarded: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

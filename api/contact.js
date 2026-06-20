// Vercel Serverless Function — POST /api/contact
// Runs on Vercel's servers (not the browser), so there is NO CORS and NO browser
// CSP to block it. It forwards the message to your inbox via Web3Forms server-side.
//
// The browser only ever talks to your own domain (/api/contact), which your CSP
// already allows via connect-src 'self'. Nothing else to configure.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { name, email, message, botcheck } = body;

    // Honeypot: silently accept bot submissions without sending.
    if (botcheck) return res.status(200).json({ success: true });

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please fill in every field." });
    }
    // Basic email sanity check.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ success: false, message: "Please enter a valid email." });
    }

    const r = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: "9b8eb045-8a64-4cd4-bb11-e23ccd43866a",
        subject: "New message from rahulkrishnan.dev",
        from_name: "rahulkrishnan.dev",
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 160),
        message: String(message).slice(0, 4000)
      })
    });

    const data = await r.json().catch(() => ({}));

    if (r.ok && data.success) {
      return res.status(200).json({ success: true });
    }
    return res.status(502).json({ success: false, message: data.message || "Delivery service error." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

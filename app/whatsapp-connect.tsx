"use client";

import { useEffect, useRef, useState } from "react";

declare global { interface Window { FB?: any; fbAsyncInit?: () => void } }

export function WhatsAppConnect({ connected, phone }: { connected: boolean; phone?: string }) {
  const [status, setStatus] = useState(connected ? `Connected${phone ? `: ${phone}` : ""}` : "");
  const [busy, setBusy] = useState(false);
  const ids = useRef<{ wabaId?: string; phoneNumberId?: string }>({});
  const appId = process.env.NEXT_PUBLIC_META_APP_ID, configId = process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID;

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (message?.type === "WA_EMBEDDED_SIGNUP" && message.event === "FINISH") ids.current = { wabaId: message.data?.waba_id, phoneNumberId: message.data?.phone_number_id };
        if (message?.type === "WA_EMBEDDED_SIGNUP" && message.event === "ERROR") setStatus(message.data?.error_message || "WhatsApp setup failed");
      } catch {}
    };
    window.addEventListener("message", receive);
    window.fbAsyncInit = () => window.FB?.init({ appId, cookie: true, xfbml: false, version: "v25.0" });
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script"); script.id = "facebook-jssdk"; script.src = "https://connect.facebook.net/en_US/sdk.js"; script.async = true; document.body.appendChild(script);
    } else window.fbAsyncInit();
    return () => window.removeEventListener("message", receive);
  }, [appId]);

  function connect() {
    if (!appId || !configId) return setStatus("Add the Meta App ID and WhatsApp Configuration ID to .env.local");
    if (!window.FB) return setStatus("Meta is still loading. Try again in a moment.");
    setBusy(true); setStatus(""); ids.current = {};
    window.FB.login(async (response: any) => {
      const code = response?.authResponse?.code;
      if (!code) { setBusy(false); return setStatus("Connection cancelled"); }
      const result = await fetch("/api/whatsapp/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, ...ids.current }) });
      const data = await result.json().catch(() => ({}));
      setBusy(false); setStatus(result.ok ? `Connected: ${data.phone || "WhatsApp"}` : data.error || "Could not connect WhatsApp");
    }, { config_id: configId, response_type: "code", override_default_response_type: true, extras: { setup: {}, sessionInfoVersion: "3" } });
  }

  return <div className="form-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}><div style={{display:"grid",gap:5}}><b>WhatsApp Business</b><small className="muted">{status || "Connect the teacher's own number for reminders and receipts."}</small></div><button className="btn" type="button" onClick={connect} disabled={busy}>{busy ? "Connecting…" : connected ? "Reconnect" : "Connect WhatsApp"}</button></div>;
}

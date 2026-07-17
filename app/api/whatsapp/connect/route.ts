import { randomInt } from "node:crypto";
import { session } from "@/lib/auth";
import { db } from "@/lib/db";
import { Tenant } from "@/lib/models";
import { encryptSecret } from "@/lib/secret.mjs";

const graph = "https://graph.facebook.com/v25.0";
const digits = (value: unknown) => /^\d+$/.test(String(value || "")) ? String(value) : "";

export async function POST(request: Request) {
  const auth = await session();
  if (!auth) return Response.json({ error: "Please sign in again" }, { status: 401 });
  const appId = process.env.NEXT_PUBLIC_META_APP_ID, secret = process.env.META_APP_SECRET;
  if (!appId || !secret) return Response.json({ error: "Meta server credentials are not configured" }, { status: 503 });
  try {
    const body = await request.json(), code = String(body.code || ""), wabaId = digits(body.wabaId), phoneNumberId = digits(body.phoneNumberId);
    if (!code || !wabaId || !phoneNumberId) return Response.json({ error: "Meta did not return the WhatsApp account details. Run setup again." }, { status: 400 });
    const exchange = await fetch(`${graph}/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(secret)}&code=${encodeURIComponent(code)}`);
    const tokenData = await exchange.json();
    if (!exchange.ok || !tokenData.access_token) throw new Error(tokenData.error?.message || "Code exchange failed");
    const token = tokenData.access_token as string, headers = { Authorization: `Bearer ${token}` };
    const phonesResponse = await fetch(`${graph}/${wabaId}/phone_numbers?fields=id,display_phone_number`, { headers });
    const phones = await phonesResponse.json(), phone = phones.data?.find((item: any) => String(item.id) === phoneNumberId);
    if (!phonesResponse.ok || !phone) throw new Error("The selected phone number does not belong to this WhatsApp account");
    const subscribed = await fetch(`${graph}/${wabaId}/subscribed_apps`, { method: "POST", headers });
    if (!subscribed.ok) throw new Error((await subscribed.json()).error?.message || "Could not subscribe WhatsApp webhooks");
    const pin = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const registered = await fetch(`${graph}/${phoneNumberId}/register`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", pin }) });
    if (!registered.ok) { const failure = await registered.json(); if (!/already registered/i.test(failure.error?.message || "")) throw new Error(failure.error?.message || "Could not register the phone number"); }
    await db();
    await Tenant.updateOne({ _id: auth.tenantId }, { $set: { whatsapp: { wabaId, phoneNumberId, displayPhoneNumber: phone.display_phone_number, accessToken: encryptSecret(token), registrationPin: encryptSecret(pin), connectedAt: new Date() } } });
    return Response.json({ phone: phone.display_phone_number });
  } catch (error) {
    console.error("WhatsApp connect failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "WhatsApp setup failed" }, { status: 400 });
  }
}

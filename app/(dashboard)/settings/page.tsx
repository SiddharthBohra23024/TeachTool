import Link from "next/link";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { ConfirmForm } from "@/app/components";
import { WhatsAppConnect } from "@/app/whatsapp-connect";
import { db } from "@/lib/db";
import { Student, Tenant } from "@/lib/models";
import { session } from "@/lib/auth";

export default async function Settings() {
  await db();
  const auth = (await session())!;
  const tenant = await Tenant.findById(auth.tenantId);
  const classes: string[] = await Student.distinct("class", { tenantId: auth.tenantId, status: "active" });
  const requestHeaders = headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const origin = host ? `${requestHeaders.get("x-forwarded-proto") || "http"}://${host}` : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${origin.replace(/\/$/, "")}/join/${tenant.enrollmentSlug}`;
  const qr = await QRCode.toDataURL(link);
  return <>
    <div className="page-head"><h1>Settings</h1></div>
    <h2 className="form-title">WhatsApp</h2>
    <WhatsAppConnect connected={!!tenant.whatsapp?.phoneNumberId} phone={tenant.whatsapp?.displayPhoneNumber}/>
    <form action="/api/settings" method="post">
      <h2 className="form-title">Profile</h2>
      <label className="field">Tuition Name<input name="tuitionName" defaultValue={tenant.tuitionName} required/></label>
      <label className="field">Logo URL<input name="logoUrl" type="url" placeholder="https://..." defaultValue={tenant.logoUrl}/></label>
      <h2 className="form-title">Payment Collection</h2>
      <div className="field-grid">
        <label className="field">Due Day of Month<input name="feeDueDay" type="number" min="1" max="28" defaultValue={tenant.feeDueDay}/><small>Between 1–28</small></label>
        <label className="field">UPI ID<input name="upiId" placeholder="number@upi" defaultValue={tenant.upiId}/></label>
      </div>
      <h2 className="form-title">Message Templates</h2>
      {(["reminder", "overdue", "receipt"] as const).map(key => <label className="field" key={key}>{key[0].toUpperCase() + key.slice(1)}<textarea name={key} rows={3} defaultValue={tenant.messageTemplates[key]} required/><small>{"{studentName} · {amount} · {dueDate} · {upiLink}"}</small></label>)}
      <button className="btn full">Save Settings</button>
    </form>
    <h2 className="form-title">Enrollment Link</h2>
    <div className="qr-card"><img src={qr} width="180" height="180" alt="Enrollment QR code"/><small>{link}</small><div className="actions"><a className="btn" href={`https://wa.me/?text=${encodeURIComponent(`Enroll at ${tenant.tuitionName}: ${link}`)}`}>Share Link</a><ConfirmForm action="/api/settings" message="Regenerate the link? The old QR will stop working."><button className="btn secondary" name="action" value="regenerate">Regenerate</button></ConfirmForm></div></div>
    <h2 className="form-title" id="broadcast">Broadcast</h2>
    <div className="form-card"><ConfirmForm action="/api/broadcast" message="Send this message now?"><label className="field">Audience<select name="class"><option value="">All students</option>{classes.map(value => <option key={value}>{value}</option>)}</select></label><label className="field">Message<textarea name="message" maxLength={1000} required/></label><button className="btn full">Send Broadcast</button></ConfirmForm></div>
    <Link className="settings-link" href="/enrollment-requests">New Enrollment Requests　›</Link>
    <form action="/api/logout" method="post"><button className="remove">Logout</button></form>
  </>;
}

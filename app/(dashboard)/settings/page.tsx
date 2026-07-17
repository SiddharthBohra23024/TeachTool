import Link from "next/link";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { CreditCard, Link2, LogOut, Megaphone, MessageSquare, Settings as SettingsIcon, UserRound } from "lucide-react";
import { ConfirmForm, PageHeader } from "@/app/components";
import { WhatsAppConnect } from "@/app/whatsapp-connect";
import { db } from "@/lib/db";
import { Student, Tenant } from "@/lib/models";
import { session } from "@/lib/auth";

const input="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-orange-500";
const title="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500";
const card="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm";

export default async function Settings() {
  await db();
  const auth=(await session())!,tenant=await Tenant.findById(auth.tenantId),classes:string[]=await Student.distinct("class",{tenantId:auth.tenantId,status:"active"}),requestHeaders=headers(),host=requestHeaders.get("x-forwarded-host")||requestHeaders.get("host"),origin=host?`${requestHeaders.get("x-forwarded-proto")||"http"}://${host}`:process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000",link=`${origin.replace(/\/$/,"")}/join/${tenant.enrollmentSlug}`,qr=await QRCode.toDataURL(link);
  return <><PageHeader title="Settings"/><div className="space-y-5 p-4">
    <section><h2 className={title}><MessageSquare className="h-4 w-4 text-emerald-500"/>WhatsApp Business</h2><WhatsAppConnect connected={!!tenant.whatsapp?.phoneNumberId} phone={tenant.whatsapp?.displayPhoneNumber}/></section>
    <form className="space-y-5" action="/api/settings" method="post">
      <section className={card}><h2 className={title}><UserRound className="h-4 w-4 text-orange-500"/>Teacher & Tuition Profile</h2><div className="mb-4 flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-xl font-bold text-white">{tenant.tuitionName[0].toUpperCase()}</div><div><b className="text-slate-800">{tenant.tuitionName}</b><p className="text-xs text-slate-400">Manage your public identity</p></div></div><label className="mb-3 block space-y-1 text-xs font-semibold text-slate-500">Tuition Name<input className={input} name="tuitionName" defaultValue={tenant.tuitionName} required/></label><label className="block space-y-1 text-xs font-semibold text-slate-500">Logo URL<input className={input} name="logoUrl" type="url" placeholder="https://..." defaultValue={tenant.logoUrl}/></label></section>
      <section className={card}><h2 className={title}><CreditCard className="h-4 w-4 text-orange-500"/>Payment Collection</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="block space-y-1 text-xs font-semibold text-slate-500">Due Day of Month<input className={input} name="feeDueDay" type="number" min="1" max="28" defaultValue={tenant.feeDueDay}/><small className="text-slate-400">Between 1–28</small></label><label className="block space-y-1 text-xs font-semibold text-slate-500">UPI ID<input className={input} name="upiId" placeholder="number@upi" defaultValue={tenant.upiId}/></label></div></section>
      <section className={card}><h2 className={title}><SettingsIcon className="h-4 w-4 text-orange-500"/>Message Templates</h2><div className="space-y-3">{(["reminder","overdue","receipt"] as const).map(key=><label className="block space-y-1 text-xs font-semibold capitalize text-slate-500" key={key}>{key}<textarea className={input} name={key} rows={3} defaultValue={tenant.messageTemplates[key]} required/><small className="font-normal text-slate-400">{"{studentName} · {amount} · {dueDate} · {upiLink}"}</small></label>)}</div></section>
      <button className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-500/20">Save Settings</button>
    </form>
    <section className={card}><h2 className={title}><Link2 className="h-4 w-4 text-orange-500"/>Enrollment Link</h2><div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center"><img className="mx-auto rounded-2xl" src={qr} width="180" height="180" alt="Enrollment QR code"/><div className="min-w-0"><p className="mb-3 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{link}</p><div className="flex flex-wrap gap-2"><a className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white" href={`https://wa.me/?text=${encodeURIComponent(`Enroll at ${tenant.tuitionName}: ${link}`)}`}>Share Link</a><ConfirmForm action="/api/settings" message="Regenerate the link? The old QR will stop working."><button className="rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-700" name="action" value="regenerate">Regenerate</button></ConfirmForm></div></div></div></section>
    <section className={card} id="broadcast"><h2 className={title}><Megaphone className="h-4 w-4 text-amber-500"/>Send Broadcast</h2><ConfirmForm action="/api/broadcast" message="Send this message now?"><div className="space-y-3"><label className="block space-y-1 text-xs font-semibold text-slate-500">Audience<select className={input} name="class"><option value="">All students</option>{classes.map(value=><option key={value}>{value}</option>)}</select></label><label className="block space-y-1 text-xs font-semibold text-slate-500">Message<textarea className={input} name="message" rows={4} maxLength={1000} required/></label><button className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white">Send Broadcast</button></div></ConfirmForm></section>
    <Link className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 font-semibold text-slate-700 shadow-sm" href="/enrollment-requests">New Enrollment Requests <span>›</span></Link>
    <form action="/api/logout" method="post"><button className="mx-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-rose-500"><LogOut className="h-4 w-4"/>Logout</button></form>
  </div></>;
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ChevronRight, ClipboardList, Home, IndianRupee, Megaphone, Plus, UserCircle, UserPlus, Users, X } from "lucide-react";

export function BottomNav(){
  const path=usePathname();
  const items=[["/dashboard",Home,"Home"],["/students",Users,"Students"],["/profile",UserCircle,"Profile"]] as const;
  return <nav className="fixed bottom-0 left-1/2 z-40 flex h-[72px] w-full max-w-4xl -translate-x-1/2 items-center justify-around border-t border-orange-100 bg-white px-4 pb-1">
    {items.map(([href,Icon,label])=><Link key={href} href={href} className={`flex flex-col items-center gap-1 p-2 ${path.startsWith(href)?"font-bold text-orange-600":"font-medium text-orange-400/80 hover:text-orange-500"}`}><Icon className="h-5 w-5"/><span className="text-[10px]">{label}</span></Link>)}
  </nav>;
}

export function PageHeader({title,back="/dashboard"}:{title:string;back?:string}){return <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-4"><Link href={back} className="rounded-xl p-2 transition hover:bg-slate-100">←</Link><h1 className="flex-1 truncate text-base font-bold text-slate-800">{title}</h1></header>}
export function ConfirmForm({action,message,children}:{action:string;message:string;children:React.ReactNode}){
  const[open,setOpen]=useState(false),form=useRef<HTMLFormElement>(null),submitter=useRef<HTMLButtonElement|null>(null),approved=useRef(false);
  function handleSubmit(e:FormEvent<HTMLFormElement>){if(approved.current)return; e.preventDefault();submitter.current=(e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null;setOpen(true)}
  function proceed(){approved.current=true;setOpen(false);form.current?.requestSubmit(submitter.current||undefined)}
  return <><form ref={form} action={action} method="post" onSubmit={handleSubmit}>{children}</form>{open&&<div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={()=>setOpen(false)}><section className="w-full max-w-sm rounded-[2rem] border border-white/60 bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={e=>e.stopPropagation()}><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl text-orange-500">?</div><h2 id="confirm-title" className="text-center text-lg font-extrabold text-slate-900">Please confirm</h2><p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-slate-500">{message}</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={()=>setOpen(false)} className="rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200">Cancel</button><button type="button" onClick={proceed} autoFocus className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600">Confirm</button></div></section></div>}</>;
}

export function QuickActions(){
  const[open,setOpen]=useState(false);
  const actions=[["/students/add",UserPlus,"Add Student"],["/enrollment-requests",ClipboardList,"Enrollment Requests"],["/payment-system#broadcast",Megaphone,"Send Broadcast"]] as const;
  return <div className="fixed bottom-[82px] right-4 z-30 flex flex-col items-end gap-3">
    {open&&<div className="flex flex-col items-end gap-2">{actions.map(([href,Icon,label])=><Link key={href} href={href} className="group flex items-center gap-3"><span className="rounded-full bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-lg">{label}</span><span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-white text-orange-500 shadow-lg transition group-hover:scale-105"><Icon className="h-5 w-5"/></span></Link>)}</div>}
    <button type="button" onClick={()=>setOpen(!open)} aria-label={open?"Close quick actions":"Open quick actions"} className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/30 transition active:scale-95">{open?<X className="h-6 w-6"/>:<Plus className="h-7 w-7"/>}</button>
  </div>;
}

export function LoginForm(){
  const[phone,setPhone]=useState(""),[otp,setOtp]=useState(""),[sent,setSent]=useState(false),[newUser,setNewUser]=useState(false),[name,setName]=useState(""),[seconds,setSeconds]=useState(0),[busy,setBusy]=useState(false);
  useEffect(()=>{if(!seconds)return;const timer=setTimeout(()=>setSeconds(seconds-1),1000);return()=>clearTimeout(timer)},[seconds]);
  async function send(){setBusy(true);const r=await fetch("/api/auth/otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone})}),data=await r.json();setBusy(false);if(!r.ok)return alert(data.error);setOtp(data.otp);setNewUser(data.newUser);setSent(true);setSeconds(30)}
  async function verify(){setBusy(true);const r=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,otp,tuitionName:name})});setBusy(false);if(r.ok)location.href="/dashboard";else alert((await r.json()).error)}
  return <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center p-4">
    <div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20"><IndianRupee className="h-8 w-8"/></div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Tuition Fee Manager</h1><p className="mt-1 text-sm text-slate-500">Digital record-keeping for tuition fees and students</p></div>
    <section className="w-full rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      {!sent?<div className="space-y-4"><div className="space-y-1"><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Enter Your Mobile Number (Owner Phone)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-slate-400">+91</span><input className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-base focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" inputMode="numeric" maxLength={10} placeholder="98765 43210" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}/></div></div><button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 disabled:opacity-50" onClick={send} disabled={busy||phone.length!==10}>Next <ChevronRight className="h-5 w-5"/></button></div>:
      <div className="space-y-4"><div className="rounded-2xl border border-orange-100/50 bg-orange-50/50 p-3 text-xs text-orange-800">Development OTP: <b>{otp}</b></div>{newUser&&<label className="block space-y-1 text-xs font-semibold uppercase text-slate-500">Tuition Classes Name<input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base normal-case text-slate-900 focus:border-orange-500 focus:outline-none" value={name} onChange={e=>setName(e.target.value)} required/></label>}<label className="block space-y-1 text-xs font-semibold uppercase text-slate-500">Enter 6-Digit OTP<input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-bold tracking-[.5em] text-slate-900 focus:border-orange-500 focus:outline-none" inputMode="numeric" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}/></label><div className="flex items-center justify-between text-xs"><button onClick={()=>setSent(false)} className="text-slate-500 underline">Change Number</button><button disabled={seconds>0||busy} onClick={send} className="font-medium text-orange-500 disabled:text-slate-400">{seconds?`Resend OTP in ${seconds}s`:"Resend OTP"}</button></div><button className="w-full rounded-2xl bg-orange-500 py-3 text-base font-semibold text-white shadow-md shadow-orange-500/20 disabled:opacity-50" onClick={verify} disabled={busy||otp.length!==6||newUser&&!name.trim()}>Verify & Login</button></div>}
    </section><div className="mt-8 text-center text-xs text-slate-400">Secure & Reliable • Data is saved securely in cloud</div>
  </main>;
}

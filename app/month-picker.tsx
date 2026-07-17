"use client";
import { CalendarDays,ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function MonthPicker({month,year}:{month:number;year:number}){
  const router=useRouter(),[loading,startTransition]=useTransition(),options=Array.from({length:24},(_,index)=>{const date=new Date();date.setDate(1);date.setMonth(date.getMonth()-index);return {month:date.getMonth()+1,year:date.getFullYear(),label:date.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}});
  return <label className={`flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition ${loading?"opacity-60":""}`}><span className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarDays className="h-4 w-4 text-orange-500"/>Account Month</span><span className="relative flex items-center"><select aria-label="Account month" className="cursor-pointer appearance-none bg-transparent py-1 pl-3 pr-7 text-sm font-extrabold text-orange-500 outline-none" value={`${year}-${month}`} onChange={e=>{const[y,m]=e.target.value.split("-");startTransition(()=>router.replace(`/dashboard?month=${m}&year=${y}`,{scroll:false}))}}>{options.map(option=><option key={`${option.year}-${option.month}`} value={`${option.year}-${option.month}`}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-orange-400"/></span></label>;
}

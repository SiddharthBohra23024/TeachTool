import Link from "next/link";
import { ConfirmForm, Icon } from "@/app/components";
import { db } from "@/lib/db";
import { FeeRecord, PendingSubmission, Student, Tenant } from "@/lib/models";
import { session } from "@/lib/auth";

export default async function Dashboard(){
  await db();
  const auth=(await session())!,tenant=await Tenant.findById(auth.tenantId),now=new Date(),month=now.getMonth()+1,year=now.getFullYear(),cutoff=new Date(year,now.getMonth(),now.getDate()+2,23,59,59);
  const [count,fees,requests]=await Promise.all([Student.countDocuments({tenantId:auth.tenantId,status:"active"}),FeeRecord.find({tenantId:auth.tenantId,month,year}).populate("studentId").lean(),PendingSubmission.countDocuments({tenantId:auth.tenantId,status:"pending"})]);
  const pending=fees.filter((f:any)=>f.status!=="paid"),paid=fees.filter((f:any)=>f.status==="paid"),due=pending.filter((f:any)=>new Date(f.dueDate)<=cutoff),money=(n:number)=>n.toLocaleString("en-IN");
  return <>
    <section className="hero">
      <div className="hero-line"><span className="avatar hero-avatar">{tenant.tuitionName.charAt(0).toUpperCase()}</span><div><small>Hello, Teacher!</small><h1>{tenant.tuitionName}</h1></div><Link href="/settings" className="gear" aria-label="Settings"><Icon name="settings"/></Link></div>
      <section className="stats"><div className="stat"><span>Total Students</span><b>{count}</b><small>Active</small></div><div className="stat green"><span>Fees Collected</span><b>₹{money(paid.reduce((n:number,f:any)=>n+f.amount,0))}</b><small>Collected</small></div><div className="stat red"><span>Pending Fees</span><b>₹{money(pending.reduce((n:number,f:any)=>n+f.amount,0))}</b><small>Pending</small></div></section>
    </section>
    {requests>0&&<Link href="/enrollment-requests" className="enrollment"><span>♟</span><div><b>{requests} new {requests===1?"child wants":"children want"} admission!</b><small>Parents filled the form using your QR/link.</small></div><i>›</i></Link>}
    <div className="section-bar"><h2 className="section-title">Current month fees</h2><small>{now.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</small></div>
    <section className="list-card">{due.length?due.map((f:any)=><div className="fee-row" key={String(f._id)}><div className="student-line"><span className="avatar">{f.studentId?.name?.charAt(0)}</span><div><b>{f.studentId?.name}</b><small>{f.studentId?.class} · Due {new Date(f.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</small></div><strong>₹{money(f.amount)}</strong></div><ConfirmForm action="/api/fees/mark-paid" message={`Mark ₹${f.amount} as paid for ${f.studentId?.name}?`}><input type="hidden" name="id" value={String(f._id)}/><button className="btn full">Mark Fee Paid</button></ConfirmForm></div>):<div className="empty"><b>All caught up</b><span>No fees are currently due.</span></div>}</section>
    <Link className="fab" href="/students/add" aria-label="Add student">＋</Link>
  </>;
}

import { redirect } from "next/navigation"; import { BottomNav } from "@/app/components"; import { session } from "@/lib/auth";
export const dynamic="force-dynamic";
export default async function DashboardLayout({children}:{children:React.ReactNode}){if(!await session())redirect("/login");return <><main className="mx-auto min-h-screen w-full max-w-4xl border-x border-slate-100/50 bg-slate-50 pb-28 shadow-md">{children}</main><BottomNav/></>}

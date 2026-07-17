import { redirect } from "next/navigation"; import { BottomNav } from "@/app/components"; import { session } from "@/lib/auth";
export const dynamic="force-dynamic";
export default async function DashboardLayout({children}:{children:React.ReactNode}){if(!await session())redirect("/login");return <><main className="shell">{children}</main><BottomNav/></>}

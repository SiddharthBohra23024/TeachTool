import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = () => new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-secret");
export async function createSession(userId: string, tenantId: string) {
  const token = await new SignJWT({ userId, tenantId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(key());
  cookies().set("session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 2592000 });
}
export async function issueDevOtp(phone:string){const configured=process.env.DEV_OTP,otp=/^\d{6}$/.test(configured||"")?configured!:String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,"0"),token=await new SignJWT({phone,otp,purpose:"otp"}).setProtectedHeader({alg:"HS256"}).setExpirationTime("5m").sign(key());cookies().set("otp",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:300});return otp}
export async function verifyDevOtp(phone:string,otp:string){const token=cookies().get("otp")?.value;if(!token)return false;try{const p=(await jwtVerify(token,key())).payload;return p.purpose==="otp"&&p.phone===phone&&p.otp===otp}catch{return false}}
export async function session() {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, key())).payload as { userId: string; tenantId: string }; } catch { return null; }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { Tenant, User } from "@/lib/models";
import { createSession, verifyDevOtp } from "@/lib/auth";
export async function POST(req: Request) {
  const { phone, otp, tuitionName } = await req.json();
  if (!/^\d{10}$/.test(phone) || !(await verifyDevOtp(phone, otp)))
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 },
    );
  await db();
  let user = await User.findOne({ phone });
  if (!user) {
    const name = String(tuitionName || "").trim();
    if (!name || name.length > 80)
      return NextResponse.json(
        { error: "Enter your tuition name" },
        { status: 400 },
      );
    const tenant = await Tenant.create({
      ownerPhone: phone,
      tuitionName: name,
      enrollmentSlug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID().slice(0, 6)}`,
    });
    try {
      user = await User.create({ phone, tenantId: tenant._id });
    } catch (error) {
      await Tenant.deleteOne({ _id: tenant._id });
      throw error;
    }
  }
  await createSession(String(user._id), String(user.tenantId));
  cookies().delete("otp");
  return NextResponse.json({ ok: true });
}

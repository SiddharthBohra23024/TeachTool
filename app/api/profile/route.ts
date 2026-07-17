import { redirect } from "next/navigation";
import { session } from "@/lib/auth";
import { db } from "@/lib/db";
import { Tenant } from "@/lib/models";

export async function POST(req:Request){
  const auth=await session();if(!auth)return new Response("Unauthorized",{status:401});
  const form=await req.formData(),ownerName=String(form.get("ownerName")||"").trim(),tuitionName=String(form.get("tuitionName")||"").trim(),ownerAvatar=String(form.get("ownerAvatar")||"orange"),ownerPhotoUrl=String(form.get("ownerPhotoUrl")||"");
  if(!ownerName||ownerName.length>80||!tuitionName||tuitionName.length>80||!/[a-z]+/.test(ownerAvatar)||ownerPhotoUrl.length>1500000||ownerPhotoUrl&&!ownerPhotoUrl.startsWith("data:image/"))return new Response("Invalid profile",{status:400});
  await db();await Tenant.updateOne({_id:auth.tenantId},{ownerName,tuitionName,ownerAvatar,ownerPhotoUrl});redirect("/profile");
}

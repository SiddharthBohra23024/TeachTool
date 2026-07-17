import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FeeRecord } from "@/lib/models";
import { withTenant } from "@/lib/withTenant";
import { sendTemplateMessage } from "@/lib/whatsapp";
export async function POST(req: Request) {
  const form = await req.formData(),
    id = String(form.get("id") || ""),
    returnTo = String(form.get("returnTo") || "/dashboard");
  if (!mongoose.isValidObjectId(id))
    return new Response("Invalid fee", { status: 400 });
  await db();
  const fee = await FeeRecord.findOneAndUpdate(
    await withTenant({ _id: id, status: { $ne: "paid" } }),
    { status: "paid", paidDate: new Date(), $unset: { receiptError: 1 } },
    { new: true },
  ).populate("studentId");
  if (fee)
    try {
      await sendTemplateMessage(
        String(fee.tenantId),
        "receipt",
        fee.studentId.parentPhone,
        { studentName: fee.studentId.name, amount: fee.amount },
      );
      await FeeRecord.updateOne(
        { _id: fee._id },
        { receiptSentAt: new Date() },
      );
    } catch (error) {
      await FeeRecord.updateOne(
        { _id: fee._id },
        {
          receiptError: error instanceof Error ? error.message : "Send failed",
        },
      );
    }
  redirect(/^\/dashboard(?:\?month=\d{1,2}&year=\d{4})?$/.test(returnTo) ? returnTo : "/dashboard");
}

import mongoose, { Schema } from "mongoose";

// ponytail: explicit document boundary avoids Mongoose's recursive inferred types exhausting the Next build worker.
const model = (name: string, schema: Schema): any => mongoose.models[name] || mongoose.model(name, schema);
const opts = { timestamps: true };

export const Tenant = model("Tenant", new Schema({
  tuitionName: { type: String, required: true, trim: true, maxlength: 80 },
  logoUrl: String,
  ownerPhone: { type: String, required: true, unique: true },
  upiId: String,
  feeDueDay: { type: Number, min: 1, max: 28, default: 5 },
  enrollmentSlug: { type: String, unique: true },
  plan: { type: String, enum: ["monthly", "annual"], default: "monthly" },
  whatsapp: { wabaId: String, phoneNumberId: String, displayPhoneNumber: String, accessToken: String, registrationPin: String, connectedAt: Date },
  messageTemplates: {
    reminder: { type: String, default: "Hi {parentName}, {studentName}'s fee of ₹{amount} is due on {dueDate}. Pay: {upiLink}" },
    overdue: { type: String, default: "Hi {parentName}, {studentName}'s fee of ₹{amount} was due on {dueDate}. Please pay soon. {upiLink}" },
    receipt: { type: String, default: "Fee received: ₹{amount} for {studentName}. Thank you!" }
  }
}, opts));

export const User = model("User", new Schema({ tenantId: { type: Schema.Types.ObjectId, required: true, index: true }, phone: { type: String, required: true, unique: true }, role: { type: String, enum: ["owner"], default: "owner" } }, opts));
export const Student = model("Student", new Schema({ tenantId: { type: Schema.Types.ObjectId, required: true, index: true }, name: { type: String, required: true, trim: true, maxlength: 80 }, parentPhone: { type: String, required: true, match: /^\d{10}$/ }, class: { type: String, required: true, trim: true, maxlength: 50 }, monthlyFee: { type: Number, required: true, min: 0 }, joinDate: { type: Date, required: true }, status: { type: String, enum: ["active", "inactive"], default: "active" } }, opts));
Student.schema.index({ tenantId: 1, status: 1, name: 1 });
export const FeeRecord = model("FeeRecord", new Schema({ tenantId: { type: Schema.Types.ObjectId, required: true, index: true }, studentId: { type: Schema.Types.ObjectId, required: true, ref: "Student" }, month: { type: Number, min: 1, max: 12, required: true }, year: { type: Number, required: true }, amount: { type: Number, min: 0, required: true }, dueDate: { type: Date, required: true }, paidDate: Date, status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" }, remindersSent: [{ type: { type: String, enum: ["reminder", "overdue"] }, sentAt: Date }], receiptSentAt: Date, receiptError: String }, opts));
FeeRecord.schema.index({ tenantId: 1, studentId: 1, month: 1, year: 1 }, { unique: true });
FeeRecord.schema.index({ status: 1, dueDate: 1 });
export const PendingSubmission = model("PendingSubmission", new Schema({ tenantId: { type: Schema.Types.ObjectId, required: true, index: true }, name: { type: String, required: true, trim: true, maxlength: 80 }, parentPhone: { type: String, required: true, match: /^\d{10}$/ }, class: { type: String, required: true, trim: true, maxlength: 50 }, sourceIp: { type: String, required: true }, submittedAt: { type: Date, default: Date.now }, status: { type: String, enum: ["pending", "added", "ignored"], default: "pending" } }, opts));
PendingSubmission.schema.index({ sourceIp: 1, submittedAt: -1 });
PendingSubmission.schema.index({ tenantId: 1, status: 1, submittedAt: 1 });
export const DevMessage = model("DevMessage", new Schema({ to: { type: String, required: true }, body: { type: String, required: true }, source: { type: String, default: "app" }, sentAt: { type: Date, default: Date.now } }, { versionKey: false }));

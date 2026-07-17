import mongoose from "mongoose";
import { db } from "@/lib/db";
export async function GET() {
  try {
    await db();
    await mongoose.connection.db?.admin().ping();
    return Response.json({ ok: true, database: mongoose.connection.name });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}

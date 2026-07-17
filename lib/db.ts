import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | undefined;
export function db() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  return connection ??= mongoose.connect(process.env.MONGODB_URI);
}

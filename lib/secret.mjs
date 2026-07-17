import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const key = () => createHash("sha256").update(process.env.WHATSAPP_ENCRYPTION_KEY || process.env.JWT_SECRET || "dev-only-secret").digest();

export function encryptSecret(value) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map(part => part.toString("base64url")).join(".");
}

export function decryptSecret(value) {
  const [iv, tag, encrypted] = value.split(".").map(part => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

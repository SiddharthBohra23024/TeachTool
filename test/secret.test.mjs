import test from "node:test";
import assert from "node:assert/strict";
import { decryptSecret, encryptSecret } from "../lib/secret.mjs";

test("WhatsApp credentials are encrypted and recoverable", () => {
  const encrypted = encryptSecret("temporary-access-token");
  assert.notEqual(encrypted, "temporary-access-token");
  assert.equal(decryptSecret(encrypted), "temporary-access-token");
});

import { session } from "./auth";
import { tenantFilter } from "./tenant.mjs";

export async function withTenant(filter: Record<string, unknown> = {}) {
  const auth = await session();
  if (!auth) throw new Error("UNAUTHORIZED");
  return tenantFilter(auth.tenantId, filter);
}

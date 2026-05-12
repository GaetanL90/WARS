import type { AuthState, AuthUser, UserRole } from "./types";

function normalizeRawRole(raw: unknown): UserRole | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");

  const aliases: Record<string, UserRole> = {
    admin: "admin",
    administrator: "admin",
    super_admin: "admin",
    superadmin: "admin",
    sys_admin: "admin",
    sysadmin: "admin",
    manager: "manager",
    management: "manager",
    technician: "technician",
    tech: "technician",
    field_technician: "technician",
    field_engineer: "technician",
    citizen: "citizen",
    user: "citizen",
    public: "citizen",
    reporter: "citizen"
  };

  if (key in aliases) {
    return aliases[key];
  }
  const direct: UserRole[] = ["admin", "manager", "technician", "citizen"];
  return (direct as string[]).includes(key) ? (key as UserRole) : null;
}

/** Maps API / persisted strings to canonical UserRole so RBAC guards never miss. */
export function normalizeAuthUser(user: AuthUser): AuthUser {
  const resolved = normalizeRawRole((user as { role?: unknown }).role);
  const role: UserRole = resolved ?? "citizen";
  return { ...user, role };
}

export function normalizeAuthState(state: AuthState): AuthState {
  return { ...state, user: normalizeAuthUser(state.user) };
}

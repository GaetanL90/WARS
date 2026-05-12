import type { UserRole } from "./types";

/**
 * Default dashboard URL after login (and “Dashboard” links from marketing home).
 *
 * Role → path (must match guarded routes in `router.tsx`)
 * - admin       → `/dashboard/infrastructure`
 * - manager     → `/dashboard/manager`
 * - technician  → `/dashboard/technician`
 * - citizen     → `/dashboard/citizen`
 */
export const ROLE_DEFAULT_DASHBOARD_PATH: Record<UserRole, string> = {
  admin: "/dashboard/infrastructure",
  manager: "/dashboard/manager",
  technician: "/dashboard/technician",
  citizen: "/dashboard/citizen"
};

export function getDashboardPathForRole(role: UserRole): string {
  return ROLE_DEFAULT_DASHBOARD_PATH[role];
}

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/**
 * True if this pathname is reachable for `role`, matching nested `ProtectedRoute allowedRoles`
 * in `router.tsx`. Used so `location.state.from` after login is not blindly replayed
 * (would drive the wrong role to `/unauthorized`).
 */
export function isDashboardPathAllowedForRole(pathname: string, role: UserRole): boolean {
  const p = normalizePath(pathname);

  if (p === "/dashboard") return false;
  if (!p.startsWith("/dashboard")) return false;

  if (p.startsWith("/dashboard/profile") || p.startsWith("/dashboard/settings")) return true;

  if (p.startsWith("/dashboard/manager")) return role === "manager";
  if (p.startsWith("/dashboard/technician")) return role === "technician";
  if (p.startsWith("/dashboard/citizen")) return role === "citizen";

  if (p.startsWith("/dashboard/users")) return role === "manager";
  if (p.startsWith("/dashboard/incidents")) return role === "manager";

  if (/\/water-point\/[^/]+\/config(?:\/|$)/.test(p)) return role === "admin";
  if (p.startsWith("/dashboard/infrastructure")) return role === "manager" || role === "admin";

  if (
    p.startsWith("/dashboard/reports/assigned") ||
    p.startsWith("/dashboard/reports/history")
  ) {
    return role === "technician" || role === "manager" || role === "admin";
  }

  if (p.startsWith("/dashboard/reports/")) return true;

  return false;
}

/** Where to send the user immediately after login (or equivalent). */
export function getPostLoginDestination(fromPathname: string | undefined, role: UserRole): string {
  const fallback = getDashboardPathForRole(role);
  if (!fromPathname) return fallback;

  const normalized = normalizePath(fromPathname);
  if (normalized === "/unauthorized") return fallback;

  if (!normalized.startsWith("/dashboard")) return fromPathname;

  if (!isDashboardPathAllowedForRole(normalized, role)) return fallback;

  return fromPathname;
}

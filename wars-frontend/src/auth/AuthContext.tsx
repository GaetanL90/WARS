import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { login as loginRequest } from "../api/authApi";
import { normalizeAuthState } from "./normalizeAuth";
import type { AuthState, LoginPayload, UserRole } from "./types";

interface AuthContextValue {
  auth: AuthState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthState>;
  logout: () => void;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const STORAGE_KEY = "wars-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.accessToken || !parsed?.user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return normalizeAuthState(parsed);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(readStoredAuth);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthState> => {
    const nextAuth = normalizeAuthState(await loginRequest(payload));
    flushSync(() => {
      setAuth(nextAuth);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    });
    return nextAuth;
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => {
      const role = auth?.user?.role;
      return role !== undefined && roles.includes(role);
    },
    [auth]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isAuthenticated: Boolean(auth),
      isLoading: false,
      login,
      logout,
      hasAnyRole
    }),
    [auth, login, logout, hasAnyRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

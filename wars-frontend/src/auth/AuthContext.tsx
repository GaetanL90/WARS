import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest } from "../api/authApi";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setAuth(JSON.parse(raw) as AuthState);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload): Promise<AuthState> => {
    const nextAuth = await loginRequest(payload);
    setAuth(nextAuth);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    return nextAuth;
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!auth) return false;
    return roles.includes(auth.user.role);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isAuthenticated: Boolean(auth),
      isLoading,
      login,
      logout,
      hasAnyRole
    }),
    [auth, isLoading]
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

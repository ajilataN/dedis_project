import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  location_id: number;
  has_drivers_licence: 0 | 1 | boolean;
  created_at?: string;
};

type AuthPayload = {
  token: string;
  user: User;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (payload: AuthPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const login = ({ token, user }: AuthPayload) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = useMemo<AuthContextValue>(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

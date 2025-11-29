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

export type Membership =
  | null
  | {
      company_id: number;
      user_id: number;
      role: "ADMIN" | "EMPLOYEE";
      status: "PENDING" | "APPROVED" | "REJECTED";
      requested_at?: string;
      approved_at?: string | null;
    };

type AuthPayload = {
  token: string;
  user: User;
  membership?: Membership;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  membership: Membership;
  login: (payload: AuthPayload) => void;
  logout: () => void;
  setMembership: (m: Membership) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const [membership, setMembership] = useState<Membership>(() => {
    const raw = localStorage.getItem("membership");
    return raw ? (JSON.parse(raw) as Membership) : null;
  });

  const login = ({ token, user, membership }: AuthPayload) => {
    setToken(token);
    setUser(user);
    setMembership(membership ?? null);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("membership", JSON.stringify(membership ?? null));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMembership(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("membership");
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, membership, login, logout, setMembership }),
    [token, user, membership]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { token, membership } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (membership?.role !== "ADMIN") return <Navigate to="/employee" replace />;
  return <>{children}</>;
}

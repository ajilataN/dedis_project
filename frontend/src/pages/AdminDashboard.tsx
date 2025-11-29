import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ maxWidth: 760, margin: "40px auto" }}>
      <h2>Admin Dashboard (placeholder)</h2>
      <p>Welcome, {user?.name} {user?.surname}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

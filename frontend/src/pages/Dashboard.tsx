import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 720, margin: "40px auto" }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name} {user?.surname}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

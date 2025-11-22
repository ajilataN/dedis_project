import { useState } from "react";
import { api } from "../api/client.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      nav("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button type="submit">Login</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

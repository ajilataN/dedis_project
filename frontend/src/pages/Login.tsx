import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
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

      if (res.data.membership?.role === "ADMIN") nav("/admin");
      else nav("/employee");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="h4 text-center mb-4">Login</h2>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button className="btn btn-primary w-100" type="submit">
                  Sign in
                </button>
              </form>

              <div className="text-center mt-3">
                <span className="text-muted">No account?</span>{" "}
                <Link to="/register">Register</Link>
              </div>
            </div>
          </div>

          <p className="text-center text-muted small mt-3 mb-0">
            Employee Transport Platform
          </p>
        </div>
      </div>
    </div>
  );
}

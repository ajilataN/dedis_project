import { useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

type Company = { id: number; name: string };

export default function EmployeeDashboard() {
  const { user, membership, setMembership, logout } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [msg, setMsg] = useState("");

  const search = async () => {
    setMsg("");
    try {
      const res = await api.get(`/companies/search?q=${encodeURIComponent(q)}&limit=10`);
      setResults(res.data.results || []);
    } catch (err) {
      setMsg("Search failed");
    }
  };

  const requestJoin = async (companyId: number) => {
    setMsg("");
    try {
      const res = await api.post(`/companies/${companyId}/join`);
      const me = await api.get("/companies/me");
      setMembership(me.data.membership);
      setMsg(`Join request sent: ${res.data.status}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMsg(err.response?.data?.message || "Join request failed");
      } else {
        setMsg("Join request failed");
      }
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Employee Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <p>
        Welcome, <b>{user?.name} {user?.surname}</b> ({user?.email})
      </p>

      <p>
        Membership:{" "}
        <b>
          {membership
            ? `${membership.role} / ${membership.status} (company_id=${membership.company_id})`
            : "No company yet"}
        </b>
      </p>

      <p>
        <Link to="/transport-plan">Go to Transport Plan</Link>
      </p>

      <hr />

      <h3>Find your company</h3>

      {membership && membership.status !== "REJECTED" ? (
        <p>You already have a membership record. If it’s PENDING, wait for approval.</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Search company name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={search} disabled={q.trim().length < 2}>
              Search
            </button>
          </div>

          {results.length > 0 && (
            <ul>
              {results.map((c) => (
                <li key={c.id} style={{ marginTop: 8 }}>
                  <b>{c.name}</b>{" "}
                  <button type="button" onClick={() => requestJoin(c.id)} style={{ marginLeft: 8 }}>
                    Request to join
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {msg && <p style={{ color: msg.toLowerCase().includes("failed") ? "crimson" : "green" }}>{msg}</p>}
    </div>
  );
}

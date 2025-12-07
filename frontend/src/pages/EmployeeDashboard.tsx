import { useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

type Company = { id: number; name: string };

export default function EmployeeDashboard() {
  const { user, membership, setMembership } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [msg, setMsg] = useState("");

  const search = async () => {
    setMsg("");
    try {
      const res = await api.get(`/companies/search?q=${encodeURIComponent(q)}&limit=10`);
      setResults(res.data.results || []);
    } catch {
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
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Join request failed");
      else setMsg("Join request failed");
    }
  };

  const statusBadge =
    !membership
      ? "bg-secondary"
      : membership.status === "APPROVED"
      ? "bg-success"
      : membership.status === "PENDING"
      ? "bg-warning text-dark"
      : "bg-danger";

  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Employee Dashboard</h2>
          <div className="text-muted">
            Welcome, <b>{user?.name} {user?.surname}</b>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {msg && (
        <div className={`alert ${msg.toLowerCase().includes("fail") ? "alert-danger" : "alert-success"} py-2`}>
          {msg}
        </div>
      )}

      <div className="row g-4">
        {/* Profile / Membership card */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Your account</h5>

              <div className="mb-2">
                <div className="text-muted small">Email</div>
                <div>{user?.email}</div>
              </div>

              <div className="mb-3">
                <div className="text-muted small">Membership</div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={`badge ${statusBadge}`}>
                    {membership ? membership.status : "NO COMPANY"}
                  </span>
                  {membership && (
                    <span className="text-muted small">
                      ({membership.role} · Company: {membership.company_name})
                    </span>
                  )}
                </div>
              </div>

              <Link className="btn btn-primary w-100" to="/transport-plan">
                View Transport Plan
              </Link>

              {membership && membership.status === "PENDING" && (
                <div className="alert alert-warning mt-3 mb-0 py-2">
                  Your request is pending approval.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company search card */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Find your company</h5>

              {membership && membership.status !== "REJECTED" ? (
                <div className="alert alert-info mb-0">
                  You already have a membership record. If it’s <b>PENDING</b>, wait for approval.
                </div>
              ) : (
                <>
                  <div className="input-group mb-3">
                    <input
                      className="form-control"
                      placeholder="Type company name..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={search}
                      disabled={q.trim().length < 2}
                    >
                      Search
                    </button>
                  </div>

                  {results.length === 0 ? (
                    <div className="text-muted">Search results will appear here.</div>
                  ) : (
                    <div className="list-group">
                      {results.map((c) => (
                        <div
                          key={c.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="fw-semibold">{c.name}</div>
                          <button
                            className="btn btn-sm btn-success"
                            type="button"
                            onClick={() => requestJoin(c.id)}
                          >
                            Request to join
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-text mt-2">
                    Tip: If your request was rejected, you can search again and request a different company.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

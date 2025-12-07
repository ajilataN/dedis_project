import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { Link } from "react-router-dom";

type MemberRow = {
  company_id: number;
  user_id: number;
  role: "ADMIN" | "EMPLOYEE";
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: string;
  approved_at: string | null;
  name: string;
  surname: string;
  email: string;
};

export default function AdminRequests() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await api.get("/admin/members");
    setMembers(res.data.members || []);
  };

  useEffect(() => {
    load().catch(() => setMsg("Failed to load members"));
  }, []);

  const pending = useMemo(() => members.filter((m) => m.status === "PENDING"), [members]);
  const approved = useMemo(() => members.filter((m) => m.status === "APPROVED"), [members]);

  const approve = async (userId: number) => {
    setMsg("");
    try {
      await api.post(`/admin/requests/${userId}/approve`);
      await load();
      setMsg("Approved");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Approve failed");
      else setMsg("Approve failed");
    }
  };

  const reject = async (userId: number) => {
    setMsg("");
    try {
      await api.post(`/admin/requests/${userId}/reject`);
      await load();
      setMsg("Rejected");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Reject failed");
      else setMsg("Reject failed");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h2 className="mb-1">Requests & Members</h2>
          <Link to="/admin" className="text-decoration-none">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`alert ${msg.toLowerCase().includes("fail") ? "alert-danger" : "alert-success"} py-2`}>
          {msg}
        </div>
      )}

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Pending</div>
                <div className="h4 mb-0">{pending.length}</div>
              </div>
              <span className="badge bg-warning text-dark">Needs review</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Approved</div>
                <div className="h4 mb-0">{approved.length}</div>
              </div>
              <span className="badge bg-success">Active</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Total records</div>
                <div className="h4 mb-0">{members.length}</div>
              </div>
              <span className="badge bg-dark">Company</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Pending requests</h5>
            <span className="badge bg-warning text-dark">{pending.length}</span>
          </div>

          {pending.length === 0 ? (
            <div className="alert alert-info mb-0">No pending requests.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th style={{ width: 160 }}>Requested</th>
                    <th style={{ width: 220 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((m) => (
                    <tr key={m.user_id}>
                      <td className="fw-semibold">
                        {m.name} {m.surname}
                      </td>
                      <td className="text-muted">{m.email}</td>
                      <td className="text-muted small">
                        {new Date(m.requested_at).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => approve(m.user_id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => reject(m.user_id)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-text mt-2">
            Approved employees will appear in the list below and can be assigned to groups.
          </div>
        </div>
      </div>

      {/* Approved */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Approved members</h5>
            <span className="badge bg-success">{approved.length}</span>
          </div>

          {approved.length === 0 ? (
            <div className="alert alert-info mb-0">No approved employees yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th style={{ width: 120 }}>Role</th>
                    <th style={{ width: 180 }}>Approved at</th>
                  </tr>
                </thead>
                <tbody>
                  {approved.map((m) => (
                    <tr key={m.user_id}>
                      <td className="fw-semibold">
                        {m.name} {m.surname}
                      </td>
                      <td className="text-muted">{m.email}</td>
                      <td>
                        <span className={`badge ${m.role === "ADMIN" ? "bg-dark" : "bg-secondary"}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {m.approved_at ? new Date(m.approved_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

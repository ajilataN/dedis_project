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
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Requests & Members</h2>
      <p>
        <Link to="/admin">← Back to Admin Dashboard</Link>
      </p>

      {msg && <p style={{ color: msg.toLowerCase().includes("fail") ? "crimson" : "green" }}>{msg}</p>}

      <hr />

      <h3>Pending requests</h3>
      {pending.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul>
          {pending.map((m) => (
            <li key={m.user_id} style={{ marginBottom: 10 }}>
              <b>{m.name} {m.surname}</b> ({m.email})
              <div style={{ marginTop: 6 }}>
                <button onClick={() => approve(m.user_id)}>Approve</button>
                <button onClick={() => reject(m.user_id)} style={{ marginLeft: 8 }}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Approved members</h3>
      {approved.length === 0 ? (
        <p>No approved employees yet.</p>
      ) : (
        <ul>
          {approved.map((m) => (
            <li key={m.user_id}>
              {m.name} {m.surname} — {m.email} — <b>{m.role}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

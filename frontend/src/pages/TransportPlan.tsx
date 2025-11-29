import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TransportPlan() {
  const { membership } = useAuth();

  return (
    <div style={{ maxWidth: 760, margin: "40px auto" }}>
      <h2>Transport Plan</h2>
      <p>
        <Link to="/employee">← Back to Dashboard</Link>
      </p>

      {!membership && (
        <p>You are not linked to a company yet. Go to Dashboard and request to join your company.</p>
      )}

      {membership?.status === "PENDING" && (
        <p>Your request is <b>PENDING</b>. Wait for the admin to approve you.</p>
      )}

      {membership?.status === "REJECTED" && (
        <p>Your request was <b>REJECTED</b>. You can try joining a different company.</p>
      )}

      {membership?.status === "APPROVED" && (
        <>
          <p>You are <b>APPROVED</b> in company_id={membership.company_id}.</p>
          <p>
            Route group details are not available yet (next step). Soon this page will show:
          </p>
          <ul>
            <li>Your route group</li>
            <li>Vehicle</li>
            <li>Driver</li>
            <li>Pickup order + group members</li>
          </ul>
        </>
      )}
    </div>
  );
}

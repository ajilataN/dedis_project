import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

type GroupMember = {
  user_id: number;
  name: string;
  surname: string;
  email: string;
  pickup_order: number;
  is_driver: boolean | number;
};

type TransportPlanResponse = {
  membership: {
    company_id: number;
    role: "ADMIN" | "EMPLOYEE";
    status: "PENDING" | "APPROVED" | "REJECTED";
  } | null;

  plan: null | {
    status: "NO_GROUP" | "ASSIGNED";
    group?: {
      id: number;
      name: string;
      company_location: null | {
        country: string;
        city: string;
        postal_code: string;
        street: string;
        street_number: string;
      };
    };
    vehicle?: {
      name: string;
      license_plate: string;
      capacity: number;
    };
    members?: GroupMember[];
  };
};

export default function TransportPlan() {
  const [data, setData] = useState<TransportPlanResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/companies/transport-plan")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load transport plan"));
  }, []);

  return (
    <div style={{ maxWidth: 760, margin: "40px auto" }}>
      <h2>My Transport Plan</h2>
      <p>
        <Link to="/employee">← Back to Dashboard</Link>
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!data && !error && <p>Loading...</p>}

      {/* Not in a company */}
      {data && !data.membership && (
        <p>You are not linked to a company yet.</p>
      )}

      {/* Pending / rejected */}
      {data?.membership?.status === "PENDING" && (
        <p>Your request to join the company is <b>PENDING</b>.</p>
      )}

      {data?.membership?.status === "REJECTED" && (
        <p>Your request to join the company was <b>REJECTED</b>.</p>
      )}

      {/* Approved but no group */}
      {data?.plan?.status === "NO_GROUP" && (
        <p>
          You are approved in the company, but you are not assigned to a
          transport group yet.
        </p>
      )}

      {/* Assigned to group */}
      {data?.plan?.status === "ASSIGNED" && data.plan.group && data.plan.vehicle && (
        <>
          <h3>{data.plan.group.name}</h3>

          {data.plan.group.company_location && (
            <p>
              Company location:{" "}
              {data.plan.group.company_location.city},{" "}
              {data.plan.group.company_location.street}{" "}
              {data.plan.group.company_location.street_number}
            </p>
          )}

          <p>
            Vehicle:{" "}
            <b>
              {data.plan.vehicle.name} (
              {data.plan.vehicle.license_plate})
            </b>{" "}
            — capacity {data.plan.vehicle.capacity}
          </p>

          <h4>Pickup order</h4>
          <ul>
            {data.plan.members?.map((m) => (
              <li key={m.user_id}>
                #{m.pickup_order} — {m.name} {m.surname} ({m.email}){" "}
                {m.is_driver ? <b>DRIVER</b> : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

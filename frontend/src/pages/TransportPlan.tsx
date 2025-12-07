import { useEffect, useMemo, useState } from "react";
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
    company_name?: string;
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

  const membershipStatusBadge = useMemo(() => {
    if (!data?.membership) return "bg-secondary";
    if (data.membership.status === "APPROVED") return "bg-success";
    if (data.membership.status === "PENDING") return "bg-warning text-dark";
    return "bg-danger";
  }, [data]);

  const membersSorted = useMemo(() => {
    const arr = data?.plan?.members ? [...data.plan.members] : [];
    arr.sort((a, b) => a.pickup_order - b.pickup_order);
    return arr;
  }, [data]);

  const driver = useMemo(() => {
    return membersSorted.find((m) => !!m.is_driver) || null;
  }, [membersSorted]);

  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">My Transport Plan</h2>
          <div className="text-muted">
            <Link to="/employee" className="text-decoration-none">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <div className="text-muted">Loading...</div>}

      {/* Membership summary */}
      {data && (
        <div className="card shadow-sm mb-4">
          <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <div className="text-muted small">Company</div>
              <div className="fw-semibold">
                {data.membership?.company_name
                  ? data.membership.company_name
                  : data.membership
                  ? `Company #${data.membership.company_id}`
                  : "—"}
              </div>
            </div>

            <div>
              <div className="text-muted small">Membership status</div>
              <span className={`badge ${membershipStatusBadge}`}>
                {data.membership ? data.membership.status : "NO COMPANY"}
              </span>
            </div>

            <div>
              <div className="text-muted small">Role</div>
              <div className="fw-semibold">{data.membership?.role ?? "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* States */}
      {data && !data.membership && (
        <div className="alert alert-info">
          You are not linked to a company yet. Go back to dashboard and request to join.
        </div>
      )}

      {data?.membership?.status === "PENDING" && (
        <div className="alert alert-warning">
          Your request to join the company is <b>PENDING</b>. Please wait for admin approval.
        </div>
      )}

      {data?.membership?.status === "REJECTED" && (
        <div className="alert alert-danger">
          Your request to join the company was <b>REJECTED</b>. You can try joining another company.
        </div>
      )}

      {data?.plan?.status === "NO_GROUP" && (
        <div className="alert alert-info">
          You are approved, but you are not assigned to a transport group yet.
        </div>
      )}

      {/* Assigned plan */}
      {data?.plan?.status === "ASSIGNED" && data.plan.group && data.plan.vehicle && (
        <div className="row g-4">
          {/* Group & vehicle */}
          <div className="col-12 col-lg-5">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">{data.plan.group.name}</h5>

                <div className="mb-3">
                  <div className="text-muted small">Vehicle</div>
                  <div className="fw-semibold">
                    {data.plan.vehicle.name}{" "}
                    <span className="text-muted fw-normal">
                      ({data.plan.vehicle.license_plate})
                    </span>
                  </div>
                  <div className="text-muted small">Capacity: {data.plan.vehicle.capacity}</div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small">Company location</div>
                  {data.plan.group.company_location ? (
                    <div>
                      <div className="fw-semibold">
                        {data.plan.group.company_location.city}{" "}
                        <span className="text-muted fw-normal">
                          ({data.plan.group.company_location.postal_code})
                        </span>
                      </div>
                      <div className="text-muted">
                        {data.plan.group.company_location.street}{" "}
                        {data.plan.group.company_location.street_number},{" "}
                        {data.plan.group.company_location.country}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted">Not set</div>
                  )}
                </div>

                <div>
                  <div className="text-muted small">Driver</div>
                  {driver ? (
                    <div className="fw-semibold">
                      {driver.name} {driver.surname}{" "}
                      <span className="text-muted fw-normal">({driver.email})</span>
                    </div>
                  ) : (
                    <div className="text-muted">No driver assigned</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pickup order table */}
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Pickup order</h5>

                {membersSorted.length === 0 ? (
                  <div className="text-muted">No members in this group yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: 110 }}>Order</th>
                          <th>Employee</th>
                          <th>Email</th>
                          <th style={{ width: 120 }}>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {membersSorted.map((m) => (
                          <tr key={m.user_id}>
                            <td>
                              <span className="badge bg-dark">#{m.pickup_order}</span>
                            </td>
                            <td className="fw-semibold">
                              {m.name} {m.surname}
                            </td>
                            <td className="text-muted">{m.email}</td>
                            <td>
                              {m.is_driver ? (
                                <span className="badge bg-primary">DRIVER</span>
                              ) : (
                                <span className="badge bg-secondary">PASSENGER</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="form-text mt-2">
                  If your location changes, update it in your profile (later feature).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

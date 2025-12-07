import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

type Location = {
  id: number;
  country: string;
  city: string;
  postal_code: string;
  street: string;
  street_number: string;
  created_at?: string;
};

type Company = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

const emptyLocation = (): Omit<Location, "id"> => ({
  country: "",
  city: "",
  postal_code: "",
  street: "",
  street_number: "",
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locForm, setLocForm] = useState(emptyLocation());
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await api.get("/admin/company");
    setCompany(res.data.company);
    setLocations(res.data.locations || []);
  };

  useEffect(() => {
    load().catch(() => setMsg("Failed to load company overview"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocForm((p) => ({ ...p, [name]: value }));
  };

  const addLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/admin/company/locations", { location: locForm });
      setLocForm(emptyLocation());
      await load();
      setMsg("Location added");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Failed to add location");
      else setMsg("Failed to add location");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Admin Dashboard</h2>
          <div className="text-muted">
            Logged in as <b>{user?.name} {user?.surname}</b> ({user?.email})
          </div>
        </div>
      </div>

      {msg && (
        <div className={`alert ${msg.toLowerCase().includes("fail") ? "alert-danger" : "alert-success"} py-2`}>
          {msg}
        </div>
      )}

      {!company ? (
        <div className="text-muted">Loading company overview...</div>
      ) : (
        <>
          {/* Company summary */}
          <div className="card shadow-sm mb-4">
            <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <div className="text-muted small">Company</div>
                <div className="h5 mb-0">{company.name}</div>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <Link to="/admin/requests" className="btn btn-primary">
                  Requests & Members
                </Link>
                <Link to="/admin/transport" className="btn btn-outline-primary">
                  Vehicles & Route Groups
                </Link>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Locations list */}
            <div className="col-12 col-lg-7">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Company locations</h5>
                    <span className="badge bg-dark">{locations.length}</span>
                  </div>

                  {locations.length === 0 ? (
                    <div className="alert alert-info mb-0">No locations yet. Add your first location.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>City</th>
                            <th>Address</th>
                            <th>Postal</th>
                            <th>Country</th>
                          </tr>
                        </thead>
                        <tbody>
                          {locations.map((l) => (
                            <tr key={l.id}>
                              <td className="fw-semibold">{l.city}</td>
                              <td className="text-muted">
                                {l.street} {l.street_number}
                              </td>
                              <td>{l.postal_code}</td>
                              <td>{l.country}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="form-text mt-2">
                    Locations are used when creating route groups (office/HQ selection).
                  </div>
                </div>
              </div>
            </div>

            {/* Add location form */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Add another location</h5>

                  <form onSubmit={addLocation}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Country</label>
                        <input
                          className="form-control"
                          name="country"
                          value={locForm.country}
                          onChange={onLocChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">City</label>
                        <input
                          className="form-control"
                          name="city"
                          value={locForm.city}
                          onChange={onLocChange}
                          required
                        />
                      </div>

                      <div className="col-md-5">
                        <label className="form-label">Postal code</label>
                        <input
                          className="form-control"
                          name="postal_code"
                          value={locForm.postal_code}
                          onChange={onLocChange}
                          required
                        />
                      </div>

                      <div className="col-md-5">
                        <label className="form-label">Street</label>
                        <input
                          className="form-control"
                          name="street"
                          value={locForm.street}
                          onChange={onLocChange}
                          required
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">No.</label>
                        <input
                          className="form-control"
                          name="street_number"
                          value={locForm.street_number}
                          onChange={onLocChange}
                          required
                        />
                      </div>
                    </div>

                    <button className="btn btn-success w-100 mt-3" type="submit">
                      Add location
                    </button>
                  </form>
                </div>
              </div>

              <div className="alert alert-light border mt-3 mb-0">
                <div className="fw-semibold mb-1">Next steps</div>
                <ul className="mb-0">
                  <li>Approve employee join requests</li>
                  <li>Create vehicles and route groups</li>
                  <li>Assign employees to groups + pickup order</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

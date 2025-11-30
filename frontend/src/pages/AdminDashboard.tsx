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
  const { user, logout } = useAuth();
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
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <p>
        Logged in as <b>{user?.name} {user?.surname}</b> ({user?.email})
      </p>

      <hr />

      <h3>Company</h3>
      {!company ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>
            <b>{company.name}</b> (id={company.id})
          </p>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <h4>Company locations</h4>
              {locations.length === 0 ? (
                <p>No locations yet.</p>
              ) : (
                <ul>
                  {locations.map((l) => (
                    <li key={l.id}>
                      {l.country}, {l.city} {l.postal_code}, {l.street} {l.street_number}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h4>Add another location</h4>
              <form onSubmit={addLocation}>
                <input name="country" placeholder="Country" value={locForm.country} onChange={onLocChange} />
                <br />
                <input name="city" placeholder="City" value={locForm.city} onChange={onLocChange} />
                <br />
                <input name="postal_code" placeholder="Postal code" value={locForm.postal_code} onChange={onLocChange} />
                <br />
                <input name="street" placeholder="Street" value={locForm.street} onChange={onLocChange} />
                <br />
                <input
                  name="street_number"
                  placeholder="Street number"
                  value={locForm.street_number}
                  onChange={onLocChange}
                />
                <br />
                <button type="submit">Add location</button>
              </form>
              {msg && <p style={{ color: msg.includes("Failed") ? "crimson" : "green" }}>{msg}</p>}
            </div>
          </div>

          <hr />

          <h3>Admin actions</h3>
          <ul>
            <li>
              <Link to="/admin/requests">Pending requests & employees</Link>
            </li>
            <li>
              <Link to="/admin/transport">Vehicles & route groups</Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

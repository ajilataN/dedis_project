import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { Link } from "react-router-dom";

type Vehicle = {
  id: number;
  name: string;
  license_plate: string;
  capacity: number;
};

type CompanyLocation = {
  id: number;
  country: string;
  city: string;
  postal_code: string;
  street: string;
  street_number: string;
};

type RouteGroup = {
  id: number;
  name: string;
  vehicle_id: number;
  company_location_id: number | null;
  vehicle_name: string;
  license_plate: string;
  capacity: number;
  city?: string;
  street?: string;
  street_number?: string;
};

export default function AdminTransport() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [groups, setGroups] = useState<RouteGroup[]>([]);
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [msg, setMsg] = useState("");

  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    license_plate: "",
    capacity: 4,
  });

  const [groupForm, setGroupForm] = useState({
    name: "",
    vehicle_id: "",
    company_location_id: "",
  });

  const load = async () => {
    const [v, g, c] = await Promise.all([
      api.get("/transport/vehicles"),
      api.get("/transport/route-groups"),
      api.get("/admin/company"),
    ]);

    setVehicles(v.data.vehicles || []);
    setGroups(g.data.groups || []);
    setLocations(c.data.locations || []);
  };

  useEffect(() => {
    load().catch(() => setMsg("Failed to load transport data"));
  }, []);

  const createVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/transport/vehicles", vehicleForm);
      setVehicleForm({ name: "", license_plate: "", capacity: 4 });
      await load();
      setMsg("Vehicle created");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Create vehicle failed");
      else setMsg("Create vehicle failed");
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/transport/route-groups", {
        name: groupForm.name,
        vehicle_id: Number(groupForm.vehicle_id),
        company_location_id: Number(groupForm.company_location_id),
      });
      setGroupForm({ name: "", vehicle_id: "", company_location_id: "" });
      await load();
      setMsg("Route group created");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Create group failed");
      else setMsg("Create group failed");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Vehicles & Route Groups</h2>
      <p>
        <Link to="/admin">← Back to Admin Dashboard</Link>
      </p>

      {msg && <p style={{ color: msg.toLowerCase().includes("fail") ? "crimson" : "green" }}>{msg}</p>}

      <hr />

      <h3>Create vehicle</h3>
      <form onSubmit={createVehicle}>
        <input
          placeholder="Name (e.g. Van A)"
          value={vehicleForm.name}
          onChange={(e) => setVehicleForm((p) => ({ ...p, name: e.target.value }))}
        />
        <br />
        <input
          placeholder="License plate"
          value={vehicleForm.license_plate}
          onChange={(e) => setVehicleForm((p) => ({ ...p, license_plate: e.target.value }))}
        />
        <br />
        <input
          type="number"
          placeholder="Capacity"
          value={vehicleForm.capacity}
          onChange={(e) => setVehicleForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
        />
        <br />
        <button type="submit">Create vehicle</button>
      </form>

      <h4>Vehicles</h4>
      {vehicles.length === 0 ? <p>No vehicles.</p> : (
        <ul>
          {vehicles.map((v) => (
            <li key={v.id}>
              {v.name} — {v.license_plate} — capacity {v.capacity}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Create route group</h3>
      <form onSubmit={createGroup}>
        <input
          placeholder="Group name (e.g. Morning Route)"
          value={groupForm.name}
          onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))}
        />
        <br />

        <select
          value={groupForm.vehicle_id}
          onChange={(e) => setGroupForm((p) => ({ ...p, vehicle_id: e.target.value }))}
        >
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={String(v.id)}>
              {v.name} ({v.license_plate}) cap={v.capacity}
            </option>
          ))}
        </select>
        <br />

        <select
          value={groupForm.company_location_id}
          onChange={(e) => setGroupForm((p) => ({ ...p, company_location_id: e.target.value }))}
        >
          <option value="">Select company location</option>
          {locations.map((l) => (
            <option key={l.id} value={String(l.id)}>
              {l.city}, {l.street} {l.street_number}
            </option>
          ))}
        </select>
        <br />

        <button type="submit">Create group</button>
      </form>

      <h4>Route groups</h4>
      {groups.length === 0 ? <p>No groups.</p> : (
        <ul>
          {groups.map((g) => (
            <li key={g.id}>
              <b>{g.name}</b> — vehicle: {g.vehicle_name} ({g.license_plate}) — location_id: {g.company_location_id ?? "N/A"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

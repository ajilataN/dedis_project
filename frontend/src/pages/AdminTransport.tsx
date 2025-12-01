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

type Employee = {
  user_id: number;
  name: string;
  surname: string;
  email: string;
  has_drivers_licence: 0 | 1;
};

type GroupMember = {
  user_id: number;
  pickup_order: number;
  is_driver: 0 | 1;
  name: string;
  surname: string;
  email: string;
};

export default function AdminTransport() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [groups, setGroups] = useState<RouteGroup[]>([]);
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [msg, setMsg] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

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

  const [assignForm, setAssignForm] = useState({
    user_id: "",
    pickup_order: 1,
    is_driver: false,
  });

  const load = async () => {
    const [v, g, c, e] = await Promise.all([
      api.get("/transport/vehicles"),
      api.get("/transport/route-groups"),
      api.get("/admin/company"),
      // use unassigned list if you implemented it; fallback to /admin/employees if not
      api.get("/admin/employees/unassigned").catch(() => api.get("/admin/employees")),
    ]);

    setVehicles(v.data.vehicles || []);
    setGroups(g.data.groups || []);
    setLocations(c.data.locations || []);
    setEmployees(e.data.employees || []);
  };

  useEffect(() => {
    load().catch(() => setMsg("Failed to load transport data"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadGroupMembers = async (groupId: number) => {
    const res = await api.get(`/transport/route-groups/${groupId}/members`);
    setGroupMembers(res.data.members || []);
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    setMsg("");
    try {
      await api.post(`/transport/route-groups/${selectedGroupId}/members`, {
        user_id: Number(assignForm.user_id),
        pickup_order: Number(assignForm.pickup_order),
        is_driver: !!assignForm.is_driver,
      });

      setAssignForm({ user_id: "", pickup_order: 1, is_driver: false });

      await loadGroupMembers(Number(selectedGroupId));
      await load(); // refresh employees list (unassigned shrinks)
      setMsg("Member added");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Add member failed");
      else setMsg("Add member failed");
    }
  };

  const removeMember = async (userId: number) => {
    if (!selectedGroupId) return;

    setMsg("");
    try {
      await api.delete(`/transport/route-groups/${selectedGroupId}/members/${userId}`);
      await loadGroupMembers(Number(selectedGroupId));
      await load(); // refresh unassigned list
      setMsg("Member removed");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Remove member failed");
      else setMsg("Remove member failed");
    }
  };

  const selectedGroup = groups.find((g) => String(g.id) === selectedGroupId);

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
      {vehicles.length === 0 ? (
        <p>No vehicles.</p>
      ) : (
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
      {groups.length === 0 ? (
        <p>No groups.</p>
      ) : (
        <ul>
          {groups.map((g) => (
            <li key={g.id}>
              <b>{g.name}</b> — vehicle: {g.vehicle_name} ({g.license_plate}) — location_id:{" "}
              {g.company_location_id ?? "N/A"}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Manage group members</h3>

      <select
        value={selectedGroupId}
        onChange={async (e) => {
          const v = e.target.value;
          setSelectedGroupId(v);
          setGroupMembers([]);
          setMsg("");
          if (v) {
            try {
              await loadGroupMembers(Number(v));
            } catch {
              setMsg("Failed to load group members");
            }
          }
        }}
      >
        <option value="">Select group</option>
        {groups.map((g) => (
          <option key={g.id} value={String(g.id)}>
            {g.name} (vehicle: {g.vehicle_name})
          </option>
        ))}
      </select>

      {selectedGroupId && (
        <>
          <p style={{ marginTop: 8 }}>
            Selected group: <b>{selectedGroup?.name}</b>{" "}
            {selectedGroup ? (
              <>
                — vehicle cap <b>{selectedGroup.capacity}</b>
              </>
            ) : null}
          </p>

          <h4>Current members</h4>
          {groupMembers.length === 0 ? (
            <p>No members yet.</p>
          ) : (
            <ul>
              {groupMembers.map((m) => (
                <li key={m.user_id} style={{ marginBottom: 6 }}>
                  #{m.pickup_order} — {m.name} {m.surname} ({m.email}){" "}
                  {m.is_driver ? <b>DRIVER</b> : null}
                  <button style={{ marginLeft: 8 }} onClick={() => removeMember(m.user_id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h4>Add employee</h4>
          <form onSubmit={addMember}>
            <select
              value={assignForm.user_id}
              onChange={(e) => setAssignForm((p) => ({ ...p, user_id: e.target.value }))}
            >
              <option value="">Select employee (unassigned)</option>
              {employees.map((u) => (
                <option key={u.user_id} value={String(u.user_id)}>
                  {u.surname} {u.name} ({u.email}) {u.has_drivers_licence ? "🚗" : ""}
                </option>
              ))}
            </select>
            <br />

            <input
              type="number"
              min={1}
              value={assignForm.pickup_order}
              onChange={(e) => setAssignForm((p) => ({ ...p, pickup_order: Number(e.target.value) }))}
            />
            <br />

            <label>
              <input
                type="checkbox"
                checked={assignForm.is_driver}
                onChange={(e) => setAssignForm((p) => ({ ...p, is_driver: e.target.checked }))}
              />
              Set as driver
            </label>
            <br />

            <button type="submit" disabled={!assignForm.user_id}>
              Add to group
            </button>
          </form>

          <p style={{ marginTop: 8, fontSize: 12 }}>
            Tip: If you need to change pickup order later, remove and re-add the employee with the new order.
          </p>
        </>
      )}
    </div>
  );
}

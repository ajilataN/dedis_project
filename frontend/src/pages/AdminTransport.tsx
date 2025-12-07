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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
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
      api.get("/admin/employees/unassigned").catch(() => api.get("/admin/employees")),
    ]);

    setVehicles(v.data.vehicles || []);
    setGroups(g.data.groups || []);
    setLocations(c.data.locations || []);
    setEmployees(e.data.employees || []);
  };

  useEffect(() => {
    load().catch(() => setMsg("Failed to load transport data"));
  }, []);

  const createVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/transport/vehicles", vehicleForm);
      setVehicleForm({ name: "", license_plate: "", capacity: 4 });
      await load();
      setMsg("Vehicle created");
    } catch (err) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Create vehicle failed");
      else setMsg("Create vehicle failed");
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/transport/route-groups", {
        name: groupForm.name,
        vehicle_id: Number(groupForm.vehicle_id),
        company_location_id: Number(groupForm.company_location_id),
      });
      setGroupForm({ name: "", vehicle_id: "", company_location_id: "" });
      await load();
      setMsg("Route group created");
    } catch (err) {
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
    try {
      await api.post(`/transport/route-groups/${selectedGroupId}/members`, {
        user_id: Number(assignForm.user_id),
        pickup_order: Number(assignForm.pickup_order),
        is_driver: assignForm.is_driver,
      });
      setAssignForm({ user_id: "", pickup_order: 1, is_driver: false });
      await loadGroupMembers(Number(selectedGroupId));
      await load();
      setMsg("Member added");
    } catch (err) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Add member failed");
      else setMsg("Add member failed");
    }
  };

  const removeMember = async (userId: number) => {
    try {
      await api.delete(`/transport/route-groups/${selectedGroupId}/members/${userId}`);
      await loadGroupMembers(Number(selectedGroupId));
      await load();
      setMsg("Member removed");
    } catch (err) {
      if (axios.isAxiosError(err)) setMsg(err.response?.data?.message || "Remove member failed");
      else setMsg("Remove member failed");
    }
  };

  const selectedGroup = groups.find((g) => String(g.id) === selectedGroupId);

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <div className="mb-3">
        <h2>Transport Management</h2>
        <Link to="/admin">← Back to Admin Dashboard</Link>
      </div>

      {msg && (
        <div className={`alert ${msg.includes("failed") ? "alert-danger" : "alert-success"}`}>
          {msg}
        </div>
      )}

      {/* Vehicles */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Vehicles</h5>

          <form className="row g-2 mb-3" onSubmit={createVehicle}>
            <div className="col-md-4">
              <input className="form-control" placeholder="Name" value={vehicleForm.name}
                onChange={(e) => setVehicleForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="col-md-4">
              <input className="form-control" placeholder="License plate" value={vehicleForm.license_plate}
                onChange={(e) => setVehicleForm(p => ({ ...p, license_plate: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" value={vehicleForm.capacity}
                onChange={(e) => setVehicleForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100">Add vehicle</button>
            </div>
          </form>

          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Plate</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.license_plate}</td>
                  <td>{v.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Groups */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Route Groups</h5>

          <form className="row g-2 mb-3" onSubmit={createGroup}>
            <div className="col-md-4">
              <input className="form-control" placeholder="Group name"
                value={groupForm.name}
                onChange={(e) => setGroupForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={groupForm.vehicle_id}
                onChange={(e) => setGroupForm(p => ({ ...p, vehicle_id: e.target.value }))}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={groupForm.company_location_id}
                onChange={(e) => setGroupForm(p => ({ ...p, company_location_id: e.target.value }))}>
                <option value="">Company location</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.city}, {l.street}</option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100">Add</button>
            </div>
          </form>

          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Vehicle</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{g.vehicle_name}</td>
                  <td>{g.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Members */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Group Members</h5>

          <select className="form-select mb-3"
            value={selectedGroupId}
            onChange={async (e) => {
              setSelectedGroupId(e.target.value);
              if (e.target.value) await loadGroupMembers(Number(e.target.value));
            }}>
            <option value="">Select group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {selectedGroup && (
            <>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Driver</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {groupMembers.map(m => (
                    <tr key={m.user_id}>
                      <td>{m.pickup_order}</td>
                      <td>{m.name} {m.surname}</td>
                      <td>{m.email}</td>
                      <td>{m.is_driver ? "🚗" : ""}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger"
                          onClick={() => removeMember(m.user_id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <form className="row g-2 mt-3" onSubmit={addMember}>
                <div className="col-md-5">
                  <select className="form-select"
                    value={assignForm.user_id}
                    onChange={(e) => setAssignForm(p => ({ ...p, user_id: e.target.value }))}>
                    <option value="">Select employee</option>
                    {employees.map(u => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.surname} {u.name} {u.has_drivers_licence ? "🚗" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <input type="number" min={1} className="form-control"
                    value={assignForm.pickup_order}
                    onChange={(e) => setAssignForm(p => ({ ...p, pickup_order: Number(e.target.value) }))} />
                </div>
                <div className="col-md-3 d-flex align-items-center">
                  <input type="checkbox" className="form-check-input me-2"
                    checked={assignForm.is_driver}
                    onChange={(e) => setAssignForm(p => ({ ...p, is_driver: e.target.checked }))} />
                  Driver
                </div>
                <div className="col-md-2">
                  <button className="btn btn-success w-100" disabled={!assignForm.user_id}>
                    Add
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

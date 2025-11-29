const db = require("../config/db");

const vehicleModel = require("../models/vehicle.model");
const routeGroupModel = require("../models/route_group.model");
const groupMemberModel = require("../models/group_member.model");
const companyMembersModel = require("../models/company_members.model");
const userModel = require("../models/user.model");
const companyLocationsModel = require("../models/company_locations.model");

// vehicles
async function createVehicle({ companyId, name, license_plate, capacity }) {
  if (!name || !license_plate) {
    const err = new Error("Missing vehicle name or license plate");
    err.status = 400;
    throw err;
  }
  if (!capacity || capacity <= 0) {
    const err = new Error("Capacity must be > 0");
    err.status = 400;
    throw err;
  }

  try {
    const id = await vehicleModel.createVehicle({
      company_id: companyId,
      name,
      license_plate,
      capacity,
    });
    return id;
  } catch (e) {
    if (e && e.code === "ER_DUP_ENTRY") {
      const err = new Error("License plate already exists");
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function listVehicles({ companyId }) {
  return vehicleModel.listByCompanyId(companyId);
}

// route groups
async function createRouteGroup({ companyId, vehicle_id, company_location_id, name }) {
  if (!vehicle_id || !company_location_id || !name) {
    const err = new Error("Missing vehicle_id, company_location_id or name");
    err.status = 400;
    throw err;
  }

  const vehicle = await vehicleModel.findById(vehicle_id);
  if (!vehicle || Number(vehicle.company_id) !== Number(companyId)) {
    const err = new Error("Vehicle not found for this company");
    err.status = 404;
    throw err;
  }

  const isCompanyLocation = await companyLocationsModel.isCompanyLocation(
    companyId,
    company_location_id
  );
  if (!isCompanyLocation) {
    const err = new Error("Invalid company location");
    err.status = 409;
    throw err;
  }

  try {
    const id = await routeGroupModel.createRouteGroup({
      company_id: companyId,
      vehicle_id,
      company_location_id,
      name,
      active: true,
    });
    return id;
  } catch (e) {
    if (e && e.code === "ER_DUP_ENTRY") {
      const err = new Error("This vehicle is already assigned to a group");
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function listRouteGroups({ companyId }) {
  return routeGroupModel.listByCompanyId(companyId);
}

// group members
async function addMemberToGroup({ companyId, group_id, user_id, pickup_order, is_driver }) {
  if (!group_id || !user_id || !pickup_order || pickup_order <= 0) {
    const err = new Error("Missing/invalid group_id, user_id or pickup_order");
    err.status = 400;
    throw err;
  }

  const group = await routeGroupModel.findById(group_id);
  if (!group || Number(group.company_id) !== Number(companyId)) {
    const err = new Error("Group not found for this company");
    err.status = 404;
    throw err;
  }

  // user must be an approved member of this company
  const membership = await companyMembersModel.findMembership(companyId, user_id);
  if (!membership || membership.status !== "APPROVED") {
    const err = new Error("User is not an approved member of this company");
    err.status = 409;
    throw err;
  }

  const vehicle = await vehicleModel.findById(group.vehicle_id);
  if (!vehicle) {
    const err = new Error("Vehicle not found");
    err.status = 404;
    throw err;
  }

  // capacity check
  const currentCount = await groupMemberModel.countMembers(group_id);
  if (currentCount >= Number(vehicle.capacity)) {
    const err = new Error("Group capacity exceeded");
    err.status = 409;
    throw err;
  }

  // driver rule: must have drivers licence
  if (is_driver) {
    const u = await userModel.findById(user_id);
    if (!u || !u.has_drivers_licence) {
      const err = new Error("Driver must have a driver's licence");
      err.status = 409;
      throw err;
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (is_driver) {
      await groupMemberModel.clearDriver(group_id, conn);
    }

    await groupMemberModel.addMember(
      { group_id, user_id, pickup_order, is_driver: !!is_driver },
      conn
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e && e.code === "ER_DUP_ENTRY") {
      const err = new Error("User already in group or pickup order already used");
      err.status = 409;
      throw err;
    }
    throw e;
  } finally {
    conn.release();
  }
}

async function listGroupMembers({ companyId, group_id }) {
  const group = await routeGroupModel.findById(group_id);
  if (!group || Number(group.company_id) !== Number(companyId)) {
    const err = new Error("Group not found for this company");
    err.status = 404;
    throw err;
  }

  return groupMemberModel.listMembers(group_id);
}

async function removeMemberFromGroup({ companyId, group_id, user_id }) {
  const group = await routeGroupModel.findById(group_id);
  if (!group || Number(group.company_id) !== Number(companyId)) {
    const err = new Error("Group not found for this company");
    err.status = 404;
    throw err;
  }

  const removed = await groupMemberModel.removeMember(group_id, user_id);
  if (!removed) {
    const err = new Error("Member not found in group");
    err.status = 404;
    throw err;
  }
}

module.exports = {
  createVehicle,
  listVehicles,
  createRouteGroup,
  listRouteGroups,
  addMemberToGroup,
  listGroupMembers,
  removeMemberFromGroup,
};

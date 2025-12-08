const vehicleModel = require("../models/vehicle.model");
const routeGroupModel = require("../models/route_group.model");
const companyLocationsModel = require("../models/company_locations.model");

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

  const isCompanyLocation = await companyLocationsModel.isCompanyLocation(companyId, company_location_id);
  if (!isCompanyLocation) {
    const err = new Error("Invalid company location");
    err.status = 409;
    throw err;
  }

  try {
    return await routeGroupModel.createRouteGroup({
      company_id: companyId,
      vehicle_id,
      company_location_id,
      name,
      active: true,
    });
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

module.exports = { createRouteGroup, listRouteGroups };

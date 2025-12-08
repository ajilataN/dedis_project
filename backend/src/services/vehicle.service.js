const vehicleModel = require("../models/vehicle.model");

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
    return await vehicleModel.createVehicle({
      company_id: companyId,
      name,
      license_plate,
      capacity,
    });
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

module.exports = { createVehicle, listVehicles };

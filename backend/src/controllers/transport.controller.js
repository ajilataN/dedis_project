const transportFacade = require("../services/transport.facade");

// vehicles
async function createVehicle(req, res, next) {
  try {
    const { name, license_plate, capacity } = req.body;

    const id = await transportFacade.createVehicle({
      companyId: req.companyId,
      name,
      license_plate,
      capacity: Number(capacity),
    });

    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
}

async function listVehicles(req, res, next) {
  try {
    const vehicles = await transportFacade.listVehicles({
      companyId: req.companyId,
    });
    res.json({ vehicles });
  } catch (e) {
    next(e);
  }
}

// route groups
async function createRouteGroup(req, res, next) {
  try {
    const { vehicle_id, company_location_id, name } = req.body;

    const id = await transportFacade.createRouteGroup({
      companyId: req.companyId,
      vehicle_id: Number(vehicle_id),
      company_location_id: Number(company_location_id),
      name,
    });

    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
}

async function listRouteGroups(req, res, next) {
  try {
    const groups = await transportFacade.listRouteGroups({
      companyId: req.companyId,
    });
    res.json({ groups });
  } catch (e) {
    next(e);
  }
}

// group members
async function addGroupMember(req, res, next) {
  try {
    const group_id = Number(req.params.groupId);
    const { user_id, pickup_order, is_driver } = req.body;

    await transportFacade.addMemberToGroup({
      companyId: req.companyId,
      group_id,
      user_id: Number(user_id),
      pickup_order: Number(pickup_order),
      is_driver: !!is_driver,
    });

    res.status(201).json({ message: "Member added" });
  } catch (e) {
    next(e);
  }
}

async function listGroupMembers(req, res, next) {
  try {
    const group_id = Number(req.params.groupId);

    const members = await transportFacade.listGroupMembers({
      companyId: req.companyId,
      group_id,
    });

    res.json({ members });
  } catch (e) {
    next(e);
  }
}

async function removeGroupMember(req, res, next) {
  try {
    const group_id = Number(req.params.groupId);
    const user_id = Number(req.params.userId);

    await transportFacade.removeMemberFromGroup({
      companyId: req.companyId,
      group_id,
      user_id,
    });

    res.json({ message: "Member removed" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createVehicle,
  listVehicles,
  createRouteGroup,
  listRouteGroups,
  addGroupMember,
  listGroupMembers,
  removeGroupMember,
};

const vehicleService = require("./vehicle.service");
const routeGroupService = require("./route_group.service");
const groupMemberService = require("./group_member.service");

// Facade: one entry point for all transport management use cases.
// Controller depends only on this facade, not on internal services/models.

async function createVehicle(args) {
  return vehicleService.createVehicle(args);
}

async function listVehicles(args) {
  return vehicleService.listVehicles(args);
}

async function createRouteGroup(args) {
  return routeGroupService.createRouteGroup(args);
}

async function listRouteGroups(args) {
  return routeGroupService.listRouteGroups(args);
}

async function addMemberToGroup(args) {
  return groupMemberService.addMemberToGroup(args);
}

async function listGroupMembers(args) {
  return groupMemberService.listGroupMembers(args);
}

async function removeMemberFromGroup(args) {
  return groupMemberService.removeMemberFromGroup(args);
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

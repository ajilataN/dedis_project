const companyMembersModel = require("../models/company_members.model");
const companyModel = require("../models/company.model");
const locationModel = require("../models/location.model");
const companyLocationsModel = require("../models/company_locations.model");

// list pending requests
async function listPendingRequests({ companyId }) {
  return companyMembersModel.listPending(companyId);
}

// approve join requests
async function approveRequest({ companyId, userId }) {
  const updated = await companyMembersModel.approveMembership(companyId, userId);
  if (!updated) {
    const err = new Error("Request not found or already processed");
    err.status = 404;
    throw err;
  }
}

// reject a join request
async function rejectRequest({ companyId, userId }) {
  const updated = await companyMembersModel.rejectMembership(companyId, userId);
  if (!updated) {
    const err = new Error("Request not found or already processed");
    err.status = 404;
    throw err;
  }
}

// get company locations
async function getCompanyOverview({ companyId }) {
  const company = await companyModel.findById(companyId);
  if (!company) {
    const err = new Error("Company not found");
    err.status = 404;
    throw err;
  }

  const locations = await companyLocationsModel.listLocationsByCompanyId(companyId);

  return { company, locations };
}

// add additional location of the company
async function addCompanyLocation({ companyId, location }) {
  if (!location) {
    const err = new Error("Missing location data");
    err.status = 400;
    throw err;
  }

  const locationId = await locationModel.createLocation(location);

  await companyLocationsModel.addCompanyLocation({
    company_id: companyId,
    location_id: locationId,
  });

  return locationId;
}

// list employees
async function listCompanyMembers({ companyId }) {
  return companyMembersModel.listAllByCompany(companyId);
}

// list employees that are not added to a route group yet
async function listApprovedUnassignedEmployees({ companyId }) {
  return companyMembersModel.listApprovedUnassignedEmployees(companyId);
}

module.exports = { listPendingRequests, approveRequest, rejectRequest, getCompanyOverview, addCompanyLocation, listCompanyMembers, listApprovedUnassignedEmployees };

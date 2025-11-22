const companyMembersModel = require("../models/company_members.model");

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

module.exports = { listPendingRequests, approveRequest, rejectRequest };

const companyModel = require("../models/company.model");
const companyMembersModel = require("../models/company_members.model");

// search company by name
async function searchCompanies({ query, limit = 10 }) {
  if (!query || query.trim().length < 2) {
    const err = new Error("Company name too short.");
    err.status = 400;
    throw err;
  }
  return companyModel.searchByName(query.trim(), limit);
}

// Send request for joining a company
async function requestJoinCompany({ userId, companyId }) {
  // enforce one company per user
  const existingAny = await companyMembersModel.findByUserId(userId);
  if (existingAny) {
    // If they try to join same company again
    if (Number(existingAny.company_id) === Number(companyId)) {
      const err = new Error(
        existingAny.status === "PENDING"
          ? "You already requested to join this company"
          : "You are already a member of this company"
      );
      err.status = 409;
      throw err;
    }

    const err = new Error("You are already linked to a company. Leave it before joining another.");
    err.status = 409;
    throw err;
  }

  // check if company exists
  const company = await companyModel.findById(companyId);
  if (!company) {
    const err = new Error("Company not found");
    err.status = 404;
    throw err;
  }

  // send the membership request
  await companyMembersModel.createMembership({
    company_id: companyId,
    user_id: userId,
    role: "EMPLOYEE",
    status: "PENDING",
    approved_at: null,
  });

  return { company, status: "PENDING" };
}

// retrieve user membership of a company
async function getMyMembership({ userId }) {
  const membership = await companyMembersModel.findByUserId(userId);
  return membership || null;
}

module.exports = { searchCompanies, requestJoinCompany, getMyMembership };

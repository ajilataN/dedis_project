const companyModel = require("../models/company.model");
const companyMembersModel = require("../models/company_members.model");
const groupMemberModel = require("../models/group_member.model");

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

// get user's transport plan
async function getUserTransportPlan({ userId }) {
  const membership = await companyMembersModel.findByUserId(userId);

  // not linked to company
  if (!membership) {
    return { membership: null, plan: null };
  }

  // not approved -> no plan
  if (membership.status !== "APPROVED") {
    return { membership, plan: null };
  }

  // approved -> find group
  const planHeader = await groupMemberModel.findUserGroupPlan(userId);
  if (!planHeader) {
    return { membership, plan: { status: "NO_GROUP" } };
  }

  const members = await groupMemberModel.listMembers(planHeader.group_id);

  return {
    membership,
    plan: {
      status: "ASSIGNED",
      group: {
        id: planHeader.group_id,
        name: planHeader.group_name,
        company_location: planHeader.company_location_id
          ? {
              id: planHeader.company_location_id,
              country: planHeader.company_country,
              city: planHeader.company_city,
              postal_code: planHeader.company_postal_code,
              street: planHeader.company_street,
              street_number: planHeader.company_street_number,
            }
          : null,
      },
      vehicle: {
        id: planHeader.vehicle_id,
        name: planHeader.vehicle_name,
        license_plate: planHeader.license_plate,
        capacity: planHeader.capacity,
      },
      members,
    },
  };
}


module.exports = { searchCompanies, requestJoinCompany, getMyMembership, getUserTransportPlan };

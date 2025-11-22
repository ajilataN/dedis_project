const companyMembersModel = require("../models/company_members.model");

async function adminRequired(req, res, next) {
  try {
    const userId = req.user.id;

    const membership = await companyMembersModel.findByUserId(userId);
    if (!membership) {
      return res.status(403).json({ message: "Not a company member" });
    }

    if (membership.status !== "APPROVED" || membership.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.companyId = membership.company_id;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { adminRequired };

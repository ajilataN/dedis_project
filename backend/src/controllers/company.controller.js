const companyService = require("../services/company.service");

async function search(req, res, next) {
  try {
    const query = String(req.query.q || "");
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const results = await companyService.searchCompanies({ query, limit });
    res.json({ results });
  } catch (e) {
    next(e);
  }
}

async function join(req, res, next) {
  try {
    const companyId = Number(req.params.companyId);
    if (!companyId || Number.isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company id" });
    }

    const result = await companyService.requestJoinCompany({
      userId: req.user.id,
      companyId,
    });

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const membership = await companyService.getMyMembership({ userId: req.user.id });
    res.json({ membership });
  } catch (e) {
    next(e);
  }
}

async function getUserTransportPlan(req, res, next) {
  try {
    const data = await companyService.getUserTransportPlan({ userId: req.user.id });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { search, join, me, getUserTransportPlan, };

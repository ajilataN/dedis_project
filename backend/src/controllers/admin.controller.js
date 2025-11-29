const adminService = require("../services/admin.service");

async function listPending(req, res, next) {
  try {
    const requests = await adminService.listPendingRequests({
      companyId: req.companyId,
    });
    res.json({ requests });
  } catch (e) {
    next(e);
  }
}

async function approve(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    await adminService.approveRequest({
      companyId: req.companyId,
      userId,
    });

    res.json({ message: "User approved" });
  } catch (e) {
    next(e);
  }
}

async function reject(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    await adminService.rejectRequest({
      companyId: req.companyId,
      userId,
    });

    res.json({ message: "User rejected" });
  } catch (e) {
    next(e);
  }
}

async function companyOverview(req, res, next) {
  try {
    const data = await adminService.getCompanyOverview({
      companyId: req.companyId,
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function addCompanyLocation(req, res, next) {
  try {
    const { location } = req.body;

    const locationId = await adminService.addCompanyLocation({
      companyId: req.companyId,
      location,
    });

    res.status(201).json({ location_id: locationId });
  } catch (e) {
    next(e);
  }
}

async function listMembers(req, res, next) {
  try {
    const members = await adminService.listCompanyMembers({
      companyId: req.companyId,
    });
    res.json({ members });
  } catch (e) {
    next(e);
  }
}

module.exports = { listPending, approve, reject, companyOverview, addCompanyLocation, listMembers, };

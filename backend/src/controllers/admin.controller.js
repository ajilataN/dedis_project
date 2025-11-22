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

module.exports = { listPending, approve, reject };

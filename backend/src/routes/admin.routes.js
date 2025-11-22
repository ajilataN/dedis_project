const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { adminRequired } = require("../middlewares/admin.middleware");
const { listPending, approve, reject } = require("../controllers/admin.controller");

const router = express.Router();

// All admin routes require auth + admin role
router.use(authRequired, adminRequired);

// List pending join requests
router.get("/requests", listPending);

// Approve request
router.post("/requests/:userId/approve", approve);

// Reject request
router.post("/requests/:userId/reject", reject);

module.exports = router;

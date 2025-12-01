const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { search, join, me, getUserTransportPlan } = require("../controllers/company.controller");

const router = express.Router();

// Employee searches companies (requires login)
router.get("/search", authRequired, search);

// Request to join a company (requires login)
router.post("/:companyId/join", authRequired, join);

// Get my membership
router.get("/me", authRequired, me);

// Get user's transport plan
router.get("/transport-plan", authRequired, getUserTransportPlan)

module.exports = router;

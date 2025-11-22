const express = require("express");
const { authRequired } = require("../middlewares/auth.middleware");
const { adminRequired } = require("../middlewares/admin.middleware");

const transportController = require("../controllers/transport.controller");

const router = express.Router();

// transport routes require authentication and admin role
router.use(authRequired, adminRequired);

// vehicles
router.post("/vehicles", transportController.createVehicle);
router.get("/vehicles", transportController.listVehicles);

// route groups
router.post("/route-groups", transportController.createRouteGroup);
router.get("/route-groups", transportController.listRouteGroups);

// group members
router.post(
  "/route-groups/:groupId/members",
  transportController.addGroupMember
);
router.get(
  "/route-groups/:groupId/members",
  transportController.listGroupMembers
);
router.delete(
  "/route-groups/:groupId/members/:userId",
  transportController.removeGroupMember
);

module.exports = router;

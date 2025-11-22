const express = require("express");
const {
  registerEmployee,
  registerCompanyAdmin,
  login,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register-employee", registerEmployee);
router.post("/register-company", registerCompanyAdmin);
router.post("/login", login);

module.exports = router;

const authService = require("../services/auth.service");

async function registerEmployee(req, res, next) {
  try {
    const { name, surname, email, password, has_drivers_licence, location } = req.body;

    if (!name || !surname || !email || !password || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await authService.registerEmployee({
      name,
      surname,
      email,
      password,
      has_drivers_licence,
      location,
    });

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function registerCompanyAdmin(req, res, next) {
  try {
    const { name, surname, email, password, has_drivers_licence, location, company } = req.body;

    if (!name || !surname || !email || !password || !location || !company?.name || !company?.location) {
      return res.status(400).json({ message: "Missing required fields for company registration" });
    }

    const result = await authService.registerCompanyAdmin({
      name,
      surname,
      email,
      password,
      has_drivers_licence,
      location,
      company,
    });

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing email/password" });

    const result = await authService.login({ email, password });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { registerEmployee, registerCompanyAdmin, login };

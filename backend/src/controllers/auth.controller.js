const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const { name, surname, email, password, has_drivers_licence, location } = req.body;

    if (!name || !surname || !email || !password || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await authService.register({
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

module.exports = { register, login };

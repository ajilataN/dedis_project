const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authRequired };

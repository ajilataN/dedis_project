const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const companyRoutes = require("./routes/company.routes");
const adminRoutes = require("./routes/admin.routes");
const transportRoutes = require("./routes/transport.routes");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transport", transportRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
});

const { authRequired } = require("./middlewares/auth.middleware");

// for testing purposses only, to check if the jwt works fine
// TODO: delete later
app.get("/api/me", authRequired, (req, res) => {
  res.json({ userId: req.user.id });
});


module.exports = app;

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const companyRoutes = require("./routes/company.routes");
const adminRoutes = require("./routes/admin.routes");
const transportRoutes = require("./routes/transport.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transport", transportRoutes);

const publicPath = path.join(__dirname, "public/dist");
app.use(express.static(publicPath));

app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
});

module.exports = app;

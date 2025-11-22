const db = require("../config/db");

async function findByEmail(email, executor = db) {
  const [rows] = await executor.query(
    "SELECT id, name, surname, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    "SELECT id, name, surname, email, has_drivers_licence, location_id, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function createUser(
  { name, surname, email, password_hash, location_id, has_drivers_licence },
  executor = db
) {
  const [result] = await executor.query(
    `INSERT INTO users (name, surname, email, password_hash, location_id, has_drivers_licence)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, surname, email, password_hash, location_id, has_drivers_licence ? 1 : 0]
  );
  return result.insertId;
}

module.exports = { findByEmail, findById, createUser };

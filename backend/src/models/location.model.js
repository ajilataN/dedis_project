const db = require("../config/db");

async function createLocation({ country, city, postal_code, street, street_number }, executor = db) {
  const [result] = await executor.query(
    `INSERT INTO locations (country, city, postal_code, street, street_number)
     VALUES (?, ?, ?, ?, ?)`,
    [country, city, postal_code, street, street_number]
  );

  return result.insertId;
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    `SELECT id, country, city, postal_code, street, street_number, created_at
     FROM locations
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { createLocation, findById };

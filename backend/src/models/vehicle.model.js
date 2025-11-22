const db = require("../config/db");

async function createVehicle({ company_id, name, license_plate, capacity }, executor = db) {
  const [result] = await executor.query(
    `INSERT INTO vehicles (company_id, name, license_plate, capacity)
     VALUES (?, ?, ?, ?)`,
    [company_id, name, license_plate, capacity]
  );
  return result.insertId;
}

async function listByCompanyId(company_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT id, company_id, name, license_plate, capacity, created_at
     FROM vehicles
     WHERE company_id = ?
     ORDER BY id DESC`,
    [company_id]
  );
  return rows;
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    `SELECT id, company_id, name, license_plate, capacity, created_at
     FROM vehicles
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { createVehicle, listByCompanyId, findById };

const db = require("../config/db");

async function addCompanyLocation({ company_id, location_id }, executor = db) {
  await executor.query(
    `INSERT INTO company_locations (company_id, location_id)
     VALUES (?, ?)`,
    [company_id, location_id]
  );
}

async function listLocationsByCompanyId(company_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT l.id, l.country, l.city, l.postal_code, l.street, l.street_number, l.created_at
     FROM company_locations cl
     JOIN locations l ON l.id = cl.location_id
     WHERE cl.company_id = ?
     ORDER BY l.id ASC`,
    [company_id]
  );
  return rows;
}

async function isCompanyLocation(company_id, location_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT 1 AS ok
     FROM company_locations
     WHERE company_id = ? AND location_id = ?
     LIMIT 1`,
    [company_id, location_id]
  );
  return !!rows[0];
}

module.exports = { addCompanyLocation, listLocationsByCompanyId, isCompanyLocation };


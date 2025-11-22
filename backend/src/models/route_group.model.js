const db = require("../config/db");

async function createRouteGroup({ company_id, vehicle_id, name, active = true }, executor = db) {
  const [result] = await executor.query(
    `INSERT INTO route_groups (company_id, vehicle_id, name, active)
     VALUES (?, ?, ?, ?)`,
    [company_id, vehicle_id, name, active ? 1 : 0]
  );
  return result.insertId;
}

async function listByCompanyId(company_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT rg.id, rg.company_id, rg.vehicle_id, rg.name, rg.active, rg.created_at,
            v.name AS vehicle_name, v.license_plate, v.capacity
     FROM route_groups rg
     JOIN vehicles v ON v.id = rg.vehicle_id
     WHERE rg.company_id = ?
     ORDER BY rg.id DESC`,
    [company_id]
  );
  return rows;
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    `SELECT id, company_id, vehicle_id, name, active, created_at
     FROM route_groups
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { createRouteGroup, listByCompanyId, findById };

const db = require("../config/db");

async function createCompany({ name }, executor = db) {
  const [result] = await executor.query(
    `INSERT INTO companies (name)
     VALUES (?)`,
    [name]
  );
  return result.insertId;
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    `SELECT id, name, created_at, updated_at
     FROM companies
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function searchByName(query, limit = 10, executor = db) {
  const q = `%${query}%`;
  const [rows] = await executor.query(
    `SELECT id, name
     FROM companies
     WHERE name LIKE ?
     ORDER BY name ASC
     LIMIT ?`,
    [q, Number(limit)]
  );
  return rows;
}

module.exports = { createCompany, findById, searchByName };

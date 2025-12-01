const db = require("../config/db");

async function addMember({ group_id, user_id, pickup_order, is_driver = false }, executor = db) {
  await executor.query(
    `INSERT INTO group_members (group_id, user_id, pickup_order, is_driver)
     VALUES (?, ?, ?, ?)`,
    [group_id, user_id, pickup_order, is_driver ? 1 : 0]
  );
}

async function listMembers(group_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT gm.group_id, gm.user_id, gm.pickup_order, gm.is_driver,
            u.name, u.surname, u.email
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = ?
     ORDER BY gm.pickup_order ASC`,
    [group_id]
  );
  return rows;
}

async function countMembers(group_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT COUNT(*) AS cnt
     FROM group_members
     WHERE group_id = ?`,
    [group_id]
  );
  return Number(rows[0]?.cnt || 0);
}

async function clearDriver(group_id, executor = db) {
  await executor.query(
    `UPDATE group_members
     SET is_driver = 0
     WHERE group_id = ?`,
    [group_id]
  );
}

async function setDriver(group_id, user_id, executor = db) {
  await executor.query(
    `UPDATE group_members
     SET is_driver = 1
     WHERE group_id = ? AND user_id = ?`,
    [group_id, user_id]
  );
}

async function removeMember(group_id, user_id, executor = db) {
  const [result] = await executor.query(
    `DELETE FROM group_members
     WHERE group_id = ? AND user_id = ?`,
    [group_id, user_id]
  );
  return result.affectedRows;
}

async function findUserGroupPlan(user_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT
        rg.id AS group_id,
        rg.name AS group_name,
        rg.company_id,
        rg.company_location_id,
        v.id AS vehicle_id,
        v.name AS vehicle_name,
        v.license_plate,
        v.capacity,
        cl.country AS company_country,
        cl.city AS company_city,
        cl.postal_code AS company_postal_code,
        cl.street AS company_street,
        cl.street_number AS company_street_number
     FROM group_members gm
     JOIN route_groups rg ON rg.id = gm.group_id
     JOIN vehicles v ON v.id = rg.vehicle_id
     LEFT JOIN locations cl ON cl.id = rg.company_location_id
     WHERE gm.user_id = ?
     LIMIT 1`,
    [user_id]
  );
  return rows[0] || null;
}

module.exports = { addMember, listMembers, countMembers, clearDriver, setDriver, removeMember,findUserGroupPlan };

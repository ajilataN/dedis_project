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

module.exports = { addMember, listMembers, countMembers, clearDriver, setDriver, removeMember };

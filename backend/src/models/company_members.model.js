const db = require("../config/db");

async function createMembership(
  { company_id, user_id, role = "EMPLOYEE", status = "PENDING", approved_at = null },
  executor = db
) {
  await executor.query(
    `INSERT INTO company_members (company_id, user_id, role, status, approved_at)
     VALUES (?, ?, ?, ?, ?)`,
    [company_id, user_id, role, status, approved_at]
  );
}

async function findMembership(company_id, user_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT company_id, user_id, role, status, requested_at, approved_at
     FROM company_members
     WHERE company_id = ? AND user_id = ?
     LIMIT 1`,
    [company_id, user_id]
  );
  return rows[0] || null;
}

async function findByUserId(user_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT company_id, user_id, role, status, requested_at, approved_at
     FROM company_members
     WHERE user_id = ?
     ORDER BY requested_at DESC
     LIMIT 1`,
    [user_id]
  );
  return rows[0] || null;
}

async function listPending(company_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT cm.company_id, cm.user_id, cm.role, cm.status, cm.requested_at,
            u.name, u.surname, u.email
     FROM company_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.company_id = ? AND cm.status = 'PENDING'
     ORDER BY cm.requested_at ASC`,
    [company_id]
  );
  return rows;
}

async function listAllByCompany(company_id, executor = db) {
  const [rows] = await executor.query(
    `SELECT cm.company_id, cm.user_id, cm.role, cm.status, cm.requested_at, cm.approved_at,
            u.name, u.surname, u.email
     FROM company_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.company_id = ?
     ORDER BY
       CASE cm.status
         WHEN 'PENDING' THEN 0
         WHEN 'APPROVED' THEN 1
         WHEN 'REJECTED' THEN 2
         ELSE 3
       END,
       cm.requested_at ASC`,
    [company_id]
  );
  return rows;
}

async function approveMembership(company_id, user_id, executor = db) {
  const [result] = await executor.query(
    `UPDATE company_members
     SET status = 'APPROVED',
         approved_at = NOW()
     WHERE company_id = ? AND user_id = ? AND status = 'PENDING'`,
    [company_id, user_id]
  );
  return result.affectedRows;
}

async function rejectMembership(company_id, user_id, executor = db) {
  const [result] = await executor.query(
    `UPDATE company_members
     SET status = 'REJECTED',
         approved_at = NULL
     WHERE company_id = ? AND user_id = ? AND status = 'PENDING'`,
    [company_id, user_id]
  );
  return result.affectedRows;
}

async function setRole(company_id, user_id, role, executor = db) {
  const [result] = await executor.query(
    `UPDATE company_members
     SET role = ?
     WHERE company_id = ? AND user_id = ? AND status = 'APPROVED'`,
    [role, company_id, user_id]
  );
  return result.affectedRows;
}

module.exports = {
  createMembership,
  findMembership,
  findByUserId,
  listPending,
  listAllByCompany,
  approveMembership,
  rejectMembership,
  setRole,
};

const db = require("../config/db");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const locationModel = require("../models/location.model");
const companyModel = require("../models/company.model");
const companyLocationsModel = require("../models/company_locations.model");
const companyMembersModel = require("../models/company_members.model");
const BcryptStrategy = require("../strategies/bcrypt.strategy");
const hashStrategy = new BcryptStrategy(Number(process.env.BCRYPT_ROUNDS || 10));

function signToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

// Normal user registration
async function registerEmployee({ name, surname, email, password, has_drivers_licence, location }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  // Create location entry for the user
  const location_id = await locationModel.createLocation(location);

  // hash the user's password
  const password_hash = await hashStrategy.hash(password);

  // Insert the user in the user table
  const userId = await userModel.createUser({
    name,
    surname,
    email,
    password_hash,
    location_id,
    has_drivers_licence: !!has_drivers_licence,
  });

  // create token
  const token = signToken(userId);
  const user = await userModel.findById(userId);

  return { token, user, membership: null };
}

// Register a company admin
// responsible for creating company location, admin user role
async function registerCompanyAdmin({ name, surname, email, password, has_drivers_licence, location, company }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // admin location + user
    const admin_location_id = await locationModel.createLocation(location, conn);
    const password_hash = await hashStrategy.hash(password);

    const userId = await userModel.createUser(
      {
        name,
        surname,
        email,
        password_hash,
        location_id: admin_location_id,
        has_drivers_licence: !!has_drivers_licence,
      },
      conn
    );

    // company + company location + connect the two
    const companyId = await companyModel.createCompany({ name: company.name }, conn);
    const company_location_id = await locationModel.createLocation(company.location, conn);

    await companyLocationsModel.addCompanyLocation(
      { company_id: companyId, location_id: company_location_id },
      conn
    );

    // membership as ADMIN
    await companyMembersModel.createMembership(
      {
        company_id: companyId,
        user_id: userId,
        role: "ADMIN",
        status: "APPROVED",
        approved_at: new Date(),
      },
      conn
    );

    await conn.commit();

    const token = signToken(userId);
    const user = await userModel.findById(userId);

    return {
      token,
      user,
      membership: { company_id: companyId, user_id: userId, role: "ADMIN", status: "APPROVED" },
    };
  } catch (e) {
    await conn.rollback();

    if (e && e.code === "ER_DUP_ENTRY") {
      const err = new Error("Duplicate value (email or company name already exists)");
      err.status = 409;
      throw err;
    }

    throw e;
  } finally {
    conn.release();
  }
}

async function login({ email, password }) {
  const userRow = await userModel.findByEmail(email);
  if (!userRow) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const ok = await hashStrategy.compare(password, userRow.password_hash);
  if (!ok) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = signToken(userRow.id);
  const user = await userModel.findById(userRow.id);
  const membership = await companyMembersModel.findByUserId(userRow.id);

  return { token, user, membership: membership || null };
}

module.exports = { registerEmployee, registerCompanyAdmin, login };

const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const locationModel = require("../models/location.model");
const db = require("../config/db");
const BcryptStrategy = require("../strategies/bcrypt.strategy");

const hashStrategy = new BcryptStrategy(Number(process.env.BCRYPT_ROUNDS || 10));

function signToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

async function register({ name, surname, email, password, has_drivers_licence, location }) {
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

  return { token, user };
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
  return { token, user };
}

module.exports = { register, login };

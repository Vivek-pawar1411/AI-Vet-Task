import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new AppError("Authentication service is not configured", 503);
  }
  return process.env.JWT_SECRET;
}

function createSession(user, res) {
  const token = jwt.sign({ sub: user.id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  res.cookie("session", token, cookieOptions());
}

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      throw new AppError("Name, email, and password are required", 400);
    }
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    getJwtSecret();
    const normalizedEmail = email.trim().toLowerCase();

    if (await User.exists({ email: normalizedEmail })) {
      throw new AppError("An account with this email already exists", 409);
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    createSession(user, res);
    return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      throw new AppError("Email and password are required", 400);
    }

    getJwtSecret();

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !user.password) {
      throw new AppError("Email or password is incorrect", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Email or password is incorrect", 401);
    }

    createSession(user, res);
    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
};

export const logout = (_req, res, next) => {
  try {
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = (req, res, next) => {
  try {
    return res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
  } catch (error) {
    return next(error);
  }
};
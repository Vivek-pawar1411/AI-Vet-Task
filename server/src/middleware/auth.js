import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  // 1. Token cookie se lein ya Authorization header (Bearer token) se lein
  let token = req.cookies?.session;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Please sign in to continue", 401);
  }

  // 2. Token verify karein
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT Verification failed:", err.message);
    throw new AppError("Your session is invalid or expired. Please sign in again.", 401);
  }

  // 3. User lookup
  const user = await User.findById(payload.sub).select("_id name email");
  if (!user) {
    throw new AppError("Account not found", 401);
  }

  req.user = user;
  next();
});
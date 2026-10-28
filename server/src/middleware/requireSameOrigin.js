import { AppError } from "../utils/AppError.js";

export function requireSameOrigin(req, _res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const origin = req.get("origin");
 const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ai-vet-task.vercel.app",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(url => url.trim().replace(/\/$/, "")) : [])
];
  if (origin && !allowedOrigins.includes(origin)) {
    return next(new AppError("Request origin is not allowed", 403));
  }
  next();
}

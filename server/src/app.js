import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.disable("x-powered-by");

// Security headers (cross-origin resource sharing allow karne ke liye)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Allowed frontend domains
const allowedOrigins = [
  "https://ai-vet-task.vercel.app",
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Postman ya server-to-server calls me origin undefined hota hai
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked this origin: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Pre-flight requests ke liye
app.options("*", cors());

// requireSameOrigin ko cross-domain deployment me use na karein
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
// Dono routes define kar do taaki /health aur /api/health dono kaam karein
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/ai", requireAuth, rateLimit({ windowMs: 60_000, limit: 20 }), aiRoutes);
app.use("/api/pets", requireAuth, petRoutes);
app.use("/api/appointments", requireAuth, appointmentRoutes);
app.use("/api/prescriptions", requireAuth, prescriptionRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

export default app;
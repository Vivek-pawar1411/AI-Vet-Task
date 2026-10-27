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

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  "https://ai-vet-task.vercel.app",
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
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

app.options("*", cors());

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// Base health check
app.get("/", (_req, res) => res.json({ status: "ok", message: "Server running" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Routes: Bina /api aur /api ke sath dono handle karo
const router = express.Router();
router.use("/auth", authRoutes);
router.use("/ai", requireAuth, rateLimit({ windowMs: 60_000, limit: 20 }), aiRoutes);
router.use("/pets", requireAuth, petRoutes);
router.use("/appointments", requireAuth, appointmentRoutes);
router.use("/prescriptions", requireAuth, prescriptionRoutes);

// Yahan dono paths mount kar diye:
app.use("/api", router); // local testing aur normal /api ke liye
app.use("/", router);    // Vercel serverless strip ke liye

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

export default app;
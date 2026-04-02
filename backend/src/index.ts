import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

import "./workers/email.worker";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import prestatairesRoutes from "./routes/prestataires.routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Désactiver le cache HTTP sur toutes les routes API
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  next();
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: "Trop de requetes, reessayez dans 15 minutes",
  },
});
app.use(globalLimiter);

// =============================================
// ROUTES
// =============================================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Tasky API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prestataires", prestatairesRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;

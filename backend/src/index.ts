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

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} introuvable`,
  });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Erreur non geree:", err);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Erreur serveur interne",
    });
  },
);

// =============================================
// DEMARRAGE
// =============================================

app.listen(PORT, () => {
  console.log("\n Tasky Backend demarre !");
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV}`);
  console.log(`Frontend autorise: ${process.env.FRONTEND_URL}`);
  console.log("\nRoutes disponibles:");
  console.log(`   POST /api/auth/register/client`);
  console.log(`   POST /api/auth/register/prestataire`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   POST /api/auth/logout`);
  console.log(`   POST /api/auth/refresh`);
  console.log(`   GET  /api/auth/check-email`);
  console.log(`   GET  /api/auth/check-phone`);
  console.log(`   POST /api/users/avatar`);
  console.log("\nWorker email demarre");
  console.log("Redis connecte");
});

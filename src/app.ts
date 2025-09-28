import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenvSafe from "dotenv-safe";

import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/users/routes";
import estateRoutes from "./modules/estates/routes";
import requestRoutes from "./modules/requests/routes";
import paymentRoutes from "./modules/payments/routes";
import deviceRoutes from "./modules/devices/routes";
import postRoutes from "./modules/posts/routes";

// ✅ Load env (and check required vars)
dotenvSafe.config({
  allowEmptyValues: false,
  example: ".env.example",
});

const app = express();

// ✅ Core middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));

// ✅ Basic API rate limiter (100 requests / 15 mins per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/estates", estateRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/posts", postRoutes);

// ✅ Healthcheck
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// ✅ Error handler (centralized)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;

// ✅ Optional start function (for clustering / tests)
export const startServer = (port: number) => {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
};

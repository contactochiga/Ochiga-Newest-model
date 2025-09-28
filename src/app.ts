import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/users/routes";
import estateRoutes from "./modules/estates/routes";
import requestRoutes from "./modules/requests/routes";
import paymentRoutes from "./modules/payments/routes";
import deviceRoutes from "./modules/devices/routes";
import postRoutes from "./modules/posts/routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/estates", estateRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/posts", postRoutes);

export default app;

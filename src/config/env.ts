import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || "3000";
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "change_this_refresh_secret";
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

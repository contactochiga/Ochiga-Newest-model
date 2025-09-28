// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_SECRET,
  REFRESH_EXPIRES_IN,
} from "../config/env";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}

// helper to hash the refresh token for DB storage
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// helper to create expiry date from REFRESH_EXPIRES_IN (approx)
export function getRefreshExpiresAt() {
  // simple parser: '7d' '30d' or '12h' or '15m'
  const m = REFRESH_EXPIRES_IN;
  if (!m) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const num = parseInt(m.slice(0, -1), 10);
  const unit = m.slice(-1);
  const now = Date.now();
  switch (unit) {
    case "d":
      return new Date(now + num * 24 * 60 * 60 * 1000);
    case "h":
      return new Date(now + num * 60 * 60 * 1000);
    case "m":
      return new Date(now + num * 60 * 1000);
    default:
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
  }
}

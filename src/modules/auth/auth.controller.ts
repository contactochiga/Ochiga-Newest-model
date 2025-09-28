// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshExpiresAt,
} from "../../utils/jwt";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, role = "resident", phone } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, role, phone },
    });

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshTokenRaw = signRefreshToken({ id: user.id, email: user.email, role: user.role });
    const tokenHash = hashToken(refreshTokenRaw);
    const expiresAt = getRefreshExpiresAt();

    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt, meta: {} },
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      accessToken,
      refreshToken: refreshTokenRaw,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshTokenRaw = signRefreshToken({ id: user.id, email: user.email, role: user.role });
    const tokenHash = hashToken(refreshTokenRaw);
    const expiresAt = getRefreshExpiresAt();

    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt, meta: {} },
    });

    return res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      accessToken,
      refreshToken: refreshTokenRaw,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });

    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken) as any;
    } catch (e) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokenHash = hashToken(refreshToken);
    const dbToken = await prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false },
      include: { user: true },
    });
    if (!dbToken) return res.status(401).json({ message: "Refresh token not recognized" });
    if (dbToken.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // rotate - create new refresh token and revoke old one
    const newRefreshRaw = signRefreshToken({ id: payload.id, email: payload.email, role: payload.role });
    const newHash = hashToken(newRefreshRaw);
    const expiresAt = getRefreshExpiresAt();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: dbToken.id },
        data: { revoked: true, revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: { userId: dbToken.userId, tokenHash: newHash, expiresAt, meta: {} },
      }),
    ]);

    const accessToken = signAccessToken({ id: payload.id, email: payload.email, role: payload.role });
    return res.json({ accessToken, refreshToken: newRefreshRaw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      // best-effort: respond 204
      return res.status(204).send(null);
    }
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
    return res.status(204).send(null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

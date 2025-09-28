import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";

const SALT_ROUNDS = 10;

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, role = "resident", phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, role, phone },
      select: { id: true, email: true, fullName: true, role: true, phone: true, createdAt: true },
    });

    // issue tokens
    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, phone: user.phone },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/refresh
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

    // optional: check user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ message: "User not found" });

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefresh = signRefreshToken({ id: user.id, email: user.email, role: user.role });

    return res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    console.error("refreshToken error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  // NOTE: For stateless JWTs we can't truly revoke tokens here without persistent storage.
  // In production you should store refresh token identifiers in DB and mark them revoked.
  // Here we simply respond 204 and rely on client to discard tokens.
  return res.status(204).send(null);
}

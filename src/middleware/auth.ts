import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export type AuthedRequest = Request & { user?: { id: string; role?: string; email?: string } };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing authorization token" });
    }
    const token = auth.split(" ")[1];
    const payload = verifyAccessToken(token) as any;
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    return next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// src/middleware/roles.ts
import { Request, Response, NextFunction } from "express";
import { AuthedRequest } from "./auth";

export function requireRole(role: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    if (user.role !== role) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

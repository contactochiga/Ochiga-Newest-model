import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { AuthedRequest } from "../../middleware/auth";

export async function getMe(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, phone: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("getMe err", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateMe(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { fullName, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { fullName, phone },
      select: { id: true, email: true, fullName: true, phone: true, role: true, createdAt: true },
    });
    return res.json(updated);
  } catch (err) {
    console.error("updateMe err", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// src/modules/auth/auth.validation.ts
import { z } from "zod";
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
  role: z.enum(["resident", "manager", "staff"]).optional(),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshSchema = z.object({
  refreshToken: z.string(),
});

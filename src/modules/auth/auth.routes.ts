// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { register, login, refreshToken, logout } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { RegisterSchema, LoginSchema, RefreshSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login);
router.post("/refresh", validate(RefreshSchema), refreshToken);
router.post("/logout", logout);

export default router;

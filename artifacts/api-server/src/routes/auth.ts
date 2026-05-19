import { Router, type IRouter } from "express";
import { z } from "zod";
import { createUser, findUserByEmail, findUserByUsername, verifyPassword } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const RegisterBody = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { username, email, password } = parsed.data;

  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const existingUsername = await findUserByUsername(username);
  if (existingUsername) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const user = await createUser(username, email, password);
  req.session.userId = user.id;
  req.log.info({ userId: user.id }, "User registered");
  res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  req.log.info({ userId: user.id }, "User logged in");
  res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { findUserById } = await import("../lib/auth");
  const user = await findUserById(req.session.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, username: user.username, email: user.email, role: user.role, github: user.github, bio: user.bio, createdAt: user.createdAt });
});

export default router;

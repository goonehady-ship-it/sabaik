import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "sabaik_salt").digest("hex");
}

function generateToken(adminId: number): string {
  return Buffer.from(JSON.stringify({ adminId, ts: Date.now() })).toString("base64");
}

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const hashed = hashPassword(password);
  if (admin.passwordHash !== hashed) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(admin.id);
  return res.json({
    token,
    user: { id: admin.id, username: admin.username, name: admin.name },
  });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString());
    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, payload.adminId));
    if (!admin) return res.status(401).json({ error: "Unauthorized" });
    return res.json({ id: admin.id, username: admin.username, name: admin.name });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;

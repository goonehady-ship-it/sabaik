import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/notifications", async (_req, res) => {
  const notifications = await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt));
  return res.json(notifications);
});

router.patch("/notifications/:id/read", async (req, res) => {
  const id = parseInt(req.params.id);
  const [notification] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id))
    .returning();
  if (!notification) return res.status(404).json({ error: "Not found" });
  return res.json(notification);
});

router.patch("/notifications/read-all", async (_req, res) => {
  await db.update(notificationsTable).set({ isRead: true });
  return res.json({ success: true });
});

export default router;

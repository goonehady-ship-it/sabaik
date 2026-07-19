import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/testimonials", async (_req, res) => {
  const testimonials = await db.select().from(testimonialsTable).orderBy(desc(testimonialsTable.createdAt));
  return res.json(testimonials);
});

router.post("/testimonials", async (req, res) => {
  const { clientName, company, content, rating, avatarUrl, isActive } = req.body;
  const [t] = await db.insert(testimonialsTable).values({
    clientName, company, content, rating: rating ?? 5, avatarUrl, isActive: isActive ?? true,
  }).returning();
  return res.status(201).json(t);
});

router.patch("/testimonials/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { clientName, company, content, rating, avatarUrl, isActive } = req.body;
  const [t] = await db.update(testimonialsTable)
    .set({ clientName, company, content, rating, avatarUrl, isActive })
    .where(eq(testimonialsTable.id, id))
    .returning();
  if (!t) return res.status(404).json({ error: "Not found" });
  return res.json(t);
});

router.delete("/testimonials/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
  return res.status(204).send();
});

export default router;

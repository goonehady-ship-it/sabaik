import { Router } from "express";
import { db } from "@workspace/db";
import { containersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/containers", async (_req, res) => {
  const containers = await db.select().from(containersTable).orderBy(asc(containersTable.order));
  return res.json(containers.map(c => ({
    ...c,
    pricePerDay: parseFloat(c.pricePerDay as string),
    features: Array.isArray(c.features) ? c.features : [],
  })));
});

router.post("/containers", async (req, res) => {
  const { name, size, capacity, description, features, pricePerDay, imageUrl, order, isActive } = req.body;
  const [container] = await db.insert(containersTable).values({
    name, size, capacity, description,
    features: features ?? [],
    pricePerDay: String(pricePerDay),
    imageUrl, order: order ?? 0, isActive: isActive ?? true,
  }).returning();
  return res.status(201).json({ ...container, pricePerDay: parseFloat(container.pricePerDay as string) });
});

router.patch("/containers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, size, capacity, description, features, pricePerDay, imageUrl, order, isActive } = req.body;
  const updateData: Record<string, unknown> = { name, size, capacity, description, features, imageUrl, order, isActive };
  if (pricePerDay !== undefined) updateData.pricePerDay = String(pricePerDay);
  const [container] = await db.update(containersTable)
    .set(updateData)
    .where(eq(containersTable.id, id))
    .returning();
  if (!container) return res.status(404).json({ error: "Not found" });
  return res.json({ ...container, pricePerDay: parseFloat(container.pricePerDay as string) });
});

router.delete("/containers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(containersTable).where(eq(containersTable.id, id));
  return res.status(204).send();
});

export default router;

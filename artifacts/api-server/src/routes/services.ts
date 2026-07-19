import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/services", async (_req, res) => {
  const services = await db.select().from(servicesTable).orderBy(asc(servicesTable.order));
  return res.json(services);
});

router.post("/services", async (req, res) => {
  const { title, description, icon, imageUrl, order, isActive } = req.body;
  const [service] = await db.insert(servicesTable).values({
    title, description, icon, imageUrl, order: order ?? 0, isActive: isActive ?? true,
  }).returning();
  return res.status(201).json(service);
});

router.patch("/services/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, icon, imageUrl, order, isActive } = req.body;
  const [service] = await db.update(servicesTable)
    .set({ title, description, icon, imageUrl, order, isActive })
    .where(eq(servicesTable.id, id))
    .returning();
  if (!service) return res.status(404).json({ error: "Not found" });
  return res.json(service);
});

router.delete("/services/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(servicesTable).where(eq(servicesTable.id, id));
  return res.status(204).send();
});

export default router;

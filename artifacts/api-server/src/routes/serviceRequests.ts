import { Router } from "express";
import { db } from "@workspace/db";
import { serviceRequestsTable, notificationsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/service-requests", async (req, res) => {
  const { status } = req.query;
  let query = db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt));
  if (status) {
    const requests = await db.select().from(serviceRequestsTable)
      .where(eq(serviceRequestsTable.status, status as string))
      .orderBy(desc(serviceRequestsTable.createdAt));
    return res.json(requests);
  }
  const requests = await query;
  return res.json(requests);
});

router.post("/service-requests", async (req, res) => {
  const { clientName, phone, email, serviceType, containerSize, location, duration, notes } = req.body;
  const [request] = await db.insert(serviceRequestsTable).values({
    clientName, phone, email, serviceType, containerSize, location, duration, notes,
  }).returning();

  // Create notification
  await db.insert(notificationsTable).values({
    title: "طلب خدمة جديد",
    message: `تم استلام طلب جديد من ${clientName}`,
    type: "service_request",
    refId: request.id,
    refType: "service_request",
  });

  return res.status(201).json(request);
});

router.get("/service-requests/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [request] = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id, id));
  if (!request) return res.status(404).json({ error: "Not found" });
  return res.json(request);
});

router.patch("/service-requests/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, adminNotes } = req.body;
  const [request] = await db.update(serviceRequestsTable)
    .set({ status, adminNotes, updatedAt: sql`now()` })
    .where(eq(serviceRequestsTable.id, id))
    .returning();
  if (!request) return res.status(404).json({ error: "Not found" });
  return res.json(request);
});

export default router;

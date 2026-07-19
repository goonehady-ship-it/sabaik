import { Router } from "express";
import { db } from "@workspace/db";
import {
  serviceRequestsTable,
  conversationsTable,
  notificationsTable,
} from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router = Router();

router.get("/admin/stats", async (_req, res) => {
  const [totalReq] = await db.select({ count: count() }).from(serviceRequestsTable);
  const [pendingReq] = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "pending"));
  const [inProgressReq] = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "in_progress"));
  const [completedReq] = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "completed"));
  const [totalConv] = await db.select({ count: count() }).from(conversationsTable);
  const [openConv] = await db.select({ count: count() }).from(conversationsTable).where(eq(conversationsTable.status, "open"));
  const [unreadNotif] = await db.select({ count: count() }).from(notificationsTable).where(eq(notificationsTable.isRead, false));

  const recentRequests = await db.select().from(serviceRequestsTable)
    .orderBy(desc(serviceRequestsTable.createdAt))
    .limit(5);

  return res.json({
    totalRequests: totalReq.count,
    pendingRequests: pendingReq.count,
    inProgressRequests: inProgressReq.count,
    completedRequests: completedReq.count,
    totalConversations: totalConv.count,
    openConversations: openConv.count,
    unreadNotifications: unreadNotif.count,
    recentRequests,
  });
});

export default router;

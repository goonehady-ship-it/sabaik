import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, notificationsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/conversations", async (_req, res) => {
  const conversations = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.updatedAt));
  return res.json(conversations);
});

router.post("/conversations", async (req, res) => {
  const { clientName, phone, email, subject } = req.body;
  const [conversation] = await db.insert(conversationsTable).values({
    clientName, phone, email, subject,
  }).returning();

  await db.insert(notificationsTable).values({
    title: "محادثة جديدة",
    message: `بدأ ${clientName} محادثة جديدة`,
    type: "chat",
    refId: conversation.id,
    refType: "conversation",
  });

  return res.status(201).json(conversation);
});

router.patch("/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const [conversation] = await db.update(conversationsTable)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(conversationsTable.id, id))
    .returning();
  if (!conversation) return res.status(404).json({ error: "Not found" });
  return res.json(conversation);
});

router.get("/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  const messages = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(desc(messagesTable.createdAt));
  // Mark as read
  await db.update(messagesTable).set({ isRead: "true" }).where(eq(messagesTable.conversationId, id));
  // Reset unread count
  await db.update(conversationsTable).set({ unreadCount: 0 }).where(eq(conversationsTable.id, id));
  return res.json(messages.reverse());
});

router.post("/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  const { content, senderType } = req.body;
  const [message] = await db.insert(messagesTable).values({
    conversationId: id,
    content,
    senderType: senderType ?? "client",
  }).returning();

  // Update conversation — increment unread only for client messages
  await db.update(conversationsTable)
    .set({
      lastMessage: content,
      updatedAt: new Date().toISOString(),
      unreadCount: senderType === "client" ? sql`unread_count + 1` : sql`unread_count`,
    })
    .where(eq(conversationsTable.id, id));

  return res.status(201).json({ ...message, isRead: message.isRead === "true" });
});

export default router;

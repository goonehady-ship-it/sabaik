import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const containersTable = sqliteTable("containers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  size: text("size").notNull(),
  capacity: text("capacity").notNull(),
  description: text("description").notNull(),
  features: text("features", { mode: "json" }).$type<string[]>().notNull().default([]),
  pricePerDay: real("price_per_day").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const insertContainerSchema = createInsertSchema(containersTable).omit({ id: true });
export type InsertContainer = z.infer<typeof insertContainerSchema>;
export type Container = typeof containersTable.$inferSelect;

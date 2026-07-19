import { pgTable, serial, text, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const containersTable = pgTable("containers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  capacity: text("capacity").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  pricePerDay: numeric("price_per_day", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertContainerSchema = createInsertSchema(containersTable).omit({ id: true });
export type InsertContainer = z.infer<typeof insertContainerSchema>;
export type Container = typeof containersTable.$inferSelect;

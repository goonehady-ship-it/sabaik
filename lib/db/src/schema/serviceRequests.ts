import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceRequestsTable = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  serviceType: text("service_type").notNull(),
  containerSize: text("container_size").notNull(),
  location: text("location").notNull(),
  duration: text("duration"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({ id: true, status: true, adminNotes: true, createdAt: true, updatedAt: true });
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;

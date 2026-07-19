import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companyValuesTable = pgTable("company_values", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertCompanyValueSchema = createInsertSchema(companyValuesTable).omit({ id: true });
export type InsertCompanyValue = z.infer<typeof insertCompanyValueSchema>;
export type CompanyValue = typeof companyValuesTable.$inferSelect;

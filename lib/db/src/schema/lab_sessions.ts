import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const labSessionsTable = pgTable("lab_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  labType: text("lab_type").notNull(),
  mode: text("mode").notNull(),
  payloadUsed: text("payload_used"),
  success: boolean("success").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLabSessionSchema = createInsertSchema(labSessionsTable).omit({
  id: true, createdAt: true,
});
export type InsertLabSession = z.infer<typeof insertLabSessionSchema>;
export type LabSession = typeof labSessionsTable.$inferSelect;

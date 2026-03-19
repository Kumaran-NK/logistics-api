import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shipmentVerificationsTable = pgTable("shipment_verifications", {
  id: text("id").primaryKey(),
  shipment_id: text("shipment_id").notNull(),
  scan_code: text("scan_code"),
  verification_status: text("verification_status").notNull().default("pending"),
  image_url: text("image_url"),
  damage_flag: boolean("damage_flag").notNull().default(false),
  damage_description: text("damage_description"),
  verified_by: text("verified_by"),
  confidence: text("confidence").notNull().default("mock"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertVerificationSchema = createInsertSchema(shipmentVerificationsTable).omit({ timestamp: true });
export type ShipmentVerification = typeof shipmentVerificationsTable.$inferSelect;

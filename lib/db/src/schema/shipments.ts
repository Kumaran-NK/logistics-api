import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shipmentsTable = pgTable("shipments", {
  id: text("id").primaryKey(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("pending"),
  driver_id: text("driver_id"),
  estimated_delivery: text("estimated_delivery").notNull(),
  weight_kg: real("weight_kg").notNull(),
  priority: text("priority").notNull().default("medium"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const shipmentEventsTable = pgTable("shipment_events", {
  id: text("id").primaryKey(),
  shipment_id: text("shipment_id").notNull(),
  event_type: text("event_type").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ created_at: true });
export const insertShipmentEventSchema = createInsertSchema(shipmentEventsTable).omit({ timestamp: true });
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipmentsTable.$inferSelect;
export type ShipmentEvent = typeof shipmentEventsTable.$inferSelect;

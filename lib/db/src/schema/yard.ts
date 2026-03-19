import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const yardSlotsTable = pgTable("yard_slots", {
  id: text("id").primaryKey(),
  zone: text("zone").notNull(),
  status: text("status").notNull().default("free"),
  truck_id: text("truck_id"),
  dock_id: text("dock_id"),
});

export const docksTable = pgTable("docks", {
  id: text("id").primaryKey(),
  warehouse_id: text("warehouse_id").notNull(),
  name: text("name").notNull(),
  assigned_truck: text("assigned_truck"),
  status: text("status").notNull().default("available"),
});

export const truckArrivalsTable = pgTable("truck_arrivals", {
  id: text("id").primaryKey(),
  truck_id: text("truck_id").notNull(),
  scheduled_time: text("scheduled_time").notNull(),
  actual_arrival: text("actual_arrival"),
  assigned_slot: text("assigned_slot"),
  dock_id: text("dock_id"),
  status: text("status").notNull().default("scheduled"),
});

export const insertYardSlotSchema = createInsertSchema(yardSlotsTable);
export const insertDockSchema = createInsertSchema(docksTable);
export const insertTruckArrivalSchema = createInsertSchema(truckArrivalsTable);
export type YardSlot = typeof yardSlotsTable.$inferSelect;
export type Dock = typeof docksTable.$inferSelect;
export type TruckArrival = typeof truckArrivalsTable.$inferSelect;

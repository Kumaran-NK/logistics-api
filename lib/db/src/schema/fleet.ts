import { pgTable, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const driversTable = pgTable("drivers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  license_number: text("license_number").notNull().unique(),
  status: text("status").notNull().default("available"),
  phone: text("phone").notNull(),
  truck_id: text("truck_id"),
  rating: real("rating").notNull().default(4.5),
  total_deliveries: integer("total_deliveries").notNull().default(0),
});

export const trucksTable = pgTable("trucks", {
  truck_id: text("truck_id").primaryKey(),
  license_plate: text("license_plate").notNull().unique(),
  model: text("model").notNull(),
  capacity_kg: real("capacity_kg").notNull(),
  status: text("status").notNull().default("available"),
  driver_id: text("driver_id"),
});

export const locationsTable = pgTable("locations", {
  id: text("id").primaryKey(),
  truck_id: text("truck_id").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  speed_kmh: real("speed_kmh").notNull().default(0),
  fuel_pct: real("fuel_pct").notNull().default(100),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDriverSchema = createInsertSchema(driversTable);
export const insertTruckSchema = createInsertSchema(trucksTable);
export const insertLocationSchema = createInsertSchema(locationsTable).omit({ updated_at: true });
export type Driver = typeof driversTable.$inferSelect;
export type Truck = typeof trucksTable.$inferSelect;
export type Location = typeof locationsTable.$inferSelect;

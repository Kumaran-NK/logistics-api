import { pgTable, text, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const routesTable = pgTable("routes", {
  route_id: text("route_id").primaryKey(),
  shipment_id: text("shipment_id"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  distance_km: real("distance_km").notNull(),
  estimated_time: text("estimated_time").notNull(),
  traffic_level: text("traffic_level").notNull().default("moderate"),
  optimized: boolean("optimized").notNull().default(true),
  waypoints: text("waypoints").notNull().default("[]"),
  fuel_savings_pct: real("fuel_savings_pct").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertRouteSchema = createInsertSchema(routesTable).omit({ created_at: true });
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routesTable.$inferSelect;

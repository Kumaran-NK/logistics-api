import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  product_name: text("product_name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  unit_price: real("unit_price").notNull(),
});

export const warehouseStockTable = pgTable("warehouse_stock", {
  id: text("id").primaryKey(),
  product_id: text("product_id").notNull(),
  warehouse: text("warehouse").notNull(),
  quantity: integer("quantity").notNull().default(0),
  reorder_point: integer("reorder_point").notNull().default(10),
  predicted_demand: text("predicted_demand").notNull().default("MEDIUM"),
  confidence: text("confidence").notNull().default("mock"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable);
export const insertWarehouseStockSchema = createInsertSchema(warehouseStockTable).omit({ updated_at: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
export type WarehouseStock = typeof warehouseStockTable.$inferSelect;

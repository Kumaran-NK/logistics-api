import { pgTable, text, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workersTable = pgTable("workers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  warehouse_id: text("warehouse_id").notNull(),
  performance_score: real("performance_score").notNull().default(75),
  reward_points: integer("reward_points").notNull().default(0),
  tasks_completed: integer("tasks_completed").notNull().default(0),
  status: text("status").notNull().default("active"),
  ai_recommendation: text("ai_recommendation"),
});

export const workerTasksTable = pgTable("worker_tasks", {
  id: text("id").primaryKey(),
  worker_id: text("worker_id").notNull(),
  task_type: text("task_type").notNull(),
  description: text("description").notNull(),
  assigned_time: timestamp("assigned_time").defaultNow().notNull(),
  completed: boolean("completed").notNull().default(false),
  completed_time: timestamp("completed_time"),
  priority: text("priority").notNull().default("medium"),
});

export const insertWorkerSchema = createInsertSchema(workersTable);
export const insertWorkerTaskSchema = createInsertSchema(workerTasksTable).omit({ assigned_time: true });
export type Worker = typeof workersTable.$inferSelect;
export type WorkerTask = typeof workerTasksTable.$inferSelect;

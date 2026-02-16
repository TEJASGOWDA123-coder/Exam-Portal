import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sebConfigs = sqliteTable("seb_configs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  configData: text("config_data").notNull(), // The .seb file content or identifier
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false), // Auto-start flag
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type SebConfig = typeof sebConfigs.$inferSelect;
export type NewSebConfig = typeof sebConfigs.$inferInsert;

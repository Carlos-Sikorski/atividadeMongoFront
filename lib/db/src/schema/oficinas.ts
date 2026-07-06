import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const oficinasTable = pgTable("oficinas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  endereco: text("endereco").notNull(),
  especialidades: text("especialidades").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOficinaSchema = createInsertSchema(oficinasTable).omit({ id: true, createdAt: true });
export type InsertOficina = z.infer<typeof insertOficinaSchema>;
export type Oficina = typeof oficinasTable.$inferSelect;

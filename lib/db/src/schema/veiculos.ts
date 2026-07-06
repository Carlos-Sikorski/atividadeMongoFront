import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { oficinasTable } from "./oficinas";

export const veiculosTable = pgTable("veiculos", {
  id: serial("id").primaryKey(),
  placa: text("placa").notNull(),
  modelo: text("modelo").notNull(),
  ano: text("ano").notNull(),
  proprietario: text("proprietario").notNull(),
  oficinaId: integer("oficina_id").references(() => oficinasTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVeiculoSchema = createInsertSchema(veiculosTable).omit({ id: true, createdAt: true });
export type InsertVeiculo = z.infer<typeof insertVeiculoSchema>;
export type Veiculo = typeof veiculosTable.$inferSelect;

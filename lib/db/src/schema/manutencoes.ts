import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { veiculosTable } from "./veiculos";

export const manutencoesTable = pgTable("manutencoes", {
  id: serial("id").primaryKey(),
  descricao: text("descricao").notNull(),
  data: timestamp("data").defaultNow().notNull(),
  veiculoId: integer("veiculo_id").notNull().references(() => veiculosTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertManutencaoSchema = createInsertSchema(manutencoesTable).omit({ id: true, createdAt: true });
export type InsertManutencao = z.infer<typeof insertManutencaoSchema>;
export type Manutencao = typeof manutencoesTable.$inferSelect;

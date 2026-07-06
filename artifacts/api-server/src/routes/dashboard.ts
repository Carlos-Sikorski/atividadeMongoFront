import { Router } from "express";
import { db } from "@workspace/db";
import { oficinasTable, veiculosTable, manutencoesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    const [oficinasCount] = await db.select({ count: sql<number>`count(*)::int` }).from(oficinasTable);
    const [veiculosCount] = await db.select({ count: sql<number>`count(*)::int` }).from(veiculosTable);
    const [manutencoesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(manutencoesTable);

    res.json({
      totalOficinas: oficinasCount?.count ?? 0,
      totalVeiculos: veiculosCount?.count ?? 0,
      totalManutencoes: manutencoesCount?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /dashboard/veiculos-por-ano
router.get("/dashboard/veiculos-por-ano", async (req, res) => {
  try {
    const result = await db
      .select({
        ano: veiculosTable.ano,
        total: sql<number>`count(*)::int`,
      })
      .from(veiculosTable)
      .groupBy(veiculosTable.ano)
      .orderBy(veiculosTable.ano);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get veiculos por ano");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

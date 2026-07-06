import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { veiculosTable, manutencoesTable, oficinasTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateVeiculoBody,
  UpdateVeiculoBody,
  GetVeiculoParams,
  UpdateVeiculoParams,
  DeleteVeiculoParams,
} from "@workspace/api-zod";

const router = Router();

// GET /veiculos - List all vehicles
router.get("/veiculos", async (req: Request, res: Response) => {
  try {
    const veiculos = await db.select().from(veiculosTable).orderBy(veiculosTable.createdAt);
    res.json(veiculos);
  } catch (err) {
    req.log.error({ err }, "Failed to list veiculos");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /veiculos - Create vehicle
router.post("/veiculos", async (req: Request, res: Response) => {
  try {
    const parsed = CreateVeiculoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", details: parsed.error.issues });
      return;
    }
    const [veiculo] = await db.insert(veiculosTable).values(parsed.data).returning();
    res.status(201).json(veiculo);
  } catch (err) {
    req.log.error({ err }, "Failed to create veiculo");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /veiculos/:id - Get vehicle with maintenance history
// Manutencoes do not store an oficina FK, so oficinaNome is derived from the
// vehicle's current oficina (if any) as a best-effort display label.
router.get("/veiculos/:id", async (req: Request, res: Response) => {
  try {
    const parsed = GetVeiculoParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const { id } = parsed.data;

    // Fetch the vehicle (joined with oficina for the current oficina name)
    const rows = await db
      .select({
        id: veiculosTable.id,
        placa: veiculosTable.placa,
        modelo: veiculosTable.modelo,
        ano: veiculosTable.ano,
        proprietario: veiculosTable.proprietario,
        oficinaId: veiculosTable.oficinaId,
        createdAt: veiculosTable.createdAt,
        oficinaNomeAtual: oficinasTable.nome,
      })
      .from(veiculosTable)
      .leftJoin(oficinasTable, eq(veiculosTable.oficinaId, oficinasTable.id))
      .where(eq(veiculosTable.id, id));

    if (!rows.length) {
      res.status(404).json({ error: "Veiculo not found" });
      return;
    }

    const veiculo = rows[0];

    // Fetch maintenance records for this vehicle
    const manutencoes = await db
      .select({
        id: manutencoesTable.id,
        descricao: manutencoesTable.descricao,
        data: manutencoesTable.data,
        veiculoId: manutencoesTable.veiculoId,
        createdAt: manutencoesTable.createdAt,
      })
      .from(manutencoesTable)
      .where(eq(manutencoesTable.veiculoId, id))
      .orderBy(manutencoesTable.data);

    // Attach oficinaNome from the vehicle's current oficina to each record
    const manutencoesWithOficina = manutencoes.map((m) => ({
      ...m,
      oficinaNome: veiculo.oficinaNomeAtual ?? null,
    }));

    res.json({
      id: veiculo.id,
      placa: veiculo.placa,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      proprietario: veiculo.proprietario,
      oficinaId: veiculo.oficinaId,
      createdAt: veiculo.createdAt,
      manutencoes: manutencoesWithOficina,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get veiculo");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /veiculos/:id - Update vehicle
router.put("/veiculos/:id", async (req: Request, res: Response) => {
  try {
    const paramsParsed = UpdateVeiculoParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const bodyParsed = UpdateVeiculoBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Validation error", details: bodyParsed.error.issues });
      return;
    }
    const [updated] = await db
      .update(veiculosTable)
      .set(bodyParsed.data)
      .where(eq(veiculosTable.id, paramsParsed.data.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Veiculo not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update veiculo");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /veiculos/:id - Delete vehicle
router.delete("/veiculos/:id", async (req: Request, res: Response) => {
  try {
    const parsed = DeleteVeiculoParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [deleted] = await db.delete(veiculosTable).where(eq(veiculosTable.id, parsed.data.id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Veiculo not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete veiculo");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { oficinasTable, veiculosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOficinaBody,
  UpdateOficinaBody,
  GetOficinaParams,
  UpdateOficinaParams,
  DeleteOficinaParams,
} from "@workspace/api-zod";

const router = Router();

// GET /oficina - List all oficinas
router.get("/oficina", async (req: Request, res: Response) => {
  try {
    const oficinas = await db.select().from(oficinasTable).orderBy(oficinasTable.createdAt);
    res.json(oficinas);
  } catch (err) {
    req.log.error({ err }, "Failed to list oficinas");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /oficina - Create oficina
router.post("/oficina", async (req: Request, res: Response) => {
  try {
    const parsed = CreateOficinaBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", details: parsed.error.issues });
      return;
    }
    const [oficina] = await db.insert(oficinasTable).values(parsed.data).returning();
    res.status(201).json(oficina);
  } catch (err) {
    req.log.error({ err }, "Failed to create oficina");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /oficina/:id - Get oficina with vehicles
router.get("/oficina/:id", async (req: Request, res: Response) => {
  try {
    const parsed = GetOficinaParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const { id } = parsed.data;
    const [oficina] = await db.select().from(oficinasTable).where(eq(oficinasTable.id, id));
    if (!oficina) {
      res.status(404).json({ error: "Oficina not found" });
      return;
    }
    const veiculos = await db.select().from(veiculosTable).where(eq(veiculosTable.oficinaId, id));
    res.json({ ...oficina, veiculos });
  } catch (err) {
    req.log.error({ err }, "Failed to get oficina");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /oficina/:id - Update oficina
router.put("/oficina/:id", async (req: Request, res: Response) => {
  try {
    const paramsParsed = UpdateOficinaParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const bodyParsed = UpdateOficinaBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Validation error", details: bodyParsed.error.issues });
      return;
    }
    const [updated] = await db
      .update(oficinasTable)
      .set(bodyParsed.data)
      .where(eq(oficinasTable.id, paramsParsed.data.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Oficina not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update oficina");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /oficina/:id - Delete oficina
router.delete("/oficina/:id", async (req: Request, res: Response) => {
  try {
    const parsed = DeleteOficinaParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [deleted] = await db.delete(oficinasTable).where(eq(oficinasTable.id, parsed.data.id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Veiculo not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete oficina");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

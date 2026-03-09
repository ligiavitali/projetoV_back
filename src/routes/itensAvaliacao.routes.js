import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM itens_avaliacao ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar itens de avaliacao.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM itens_avaliacao WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item de avaliacao nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar item de avaliacao.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { itens, status } = req.body;

  if (!itens || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: itens, status." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO itens_avaliacao (itens, status) VALUES ($1,$2) RETURNING *",
      [itens, status]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar item de avaliacao.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { itens, status } = req.body;

  if (!itens || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: itens, status." });
  }

  try {
    const result = await pool.query(
      `UPDATE itens_avaliacao SET
        itens = $1,
        status = $2
      WHERE id = $3
      RETURNING *`,
      [itens, status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item de avaliacao nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar item de avaliacao.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM itens_avaliacao WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item de avaliacao nao encontrado." });
    }
    return res.json({ message: "Item de avaliacao removido com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover item de avaliacao.", details: error.message });
  }
});

export default router;

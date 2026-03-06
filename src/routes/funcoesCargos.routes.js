import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM funcoes_cargos ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar funcoes/cargos.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM funcoes_cargos WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Funcao/cargo nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar funcao/cargo.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, titulo_funcao, departamento, nivel, descricao, status } = req.body;

  if (!id || !titulo_funcao || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: id, titulo_funcao, status." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO funcoes_cargos (id, titulo_funcao, departamento, nivel, descricao, status)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [id, titulo_funcao, departamento ?? null, nivel ?? null, descricao ?? null, status]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar funcao/cargo.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { titulo_funcao, departamento, nivel, descricao, status } = req.body;

  if (!titulo_funcao || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: titulo_funcao, status." });
  }

  try {
    const result = await pool.query(
      `UPDATE funcoes_cargos SET
        titulo_funcao = $1,
        departamento = $2,
        nivel = $3,
        descricao = $4,
        status = $5
      WHERE id = $6
      RETURNING *`,
      [titulo_funcao, departamento ?? null, nivel ?? null, descricao ?? null, status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Funcao/cargo nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar funcao/cargo.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM funcoes_cargos WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Funcao/cargo nao encontrado." });
    }
    return res.json({ message: "Funcao/cargo removido com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover funcao/cargo.", details: error.message });
  }
});

export default router;

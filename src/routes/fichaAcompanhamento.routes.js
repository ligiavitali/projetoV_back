import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ficha_acompanhamento ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar fichas de acompanhamento.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ficha_acompanhamento WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ficha de acompanhamento nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar ficha de acompanhamento.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, id_pessoa_aluno, data_admissao, data_visita, id_empresa, parecer_geral } = req.body;

  if (!id || !id_pessoa_aluno || !data_visita || !id_empresa) {
    return res.status(400).json({
      error: "Campos obrigatorios: id, id_pessoa_aluno, data_visita, id_empresa.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ficha_acompanhamento (
        id, id_pessoa_aluno, data_admissao, data_visita, id_empresa, parecer_geral
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [id, id_pessoa_aluno, data_admissao ?? null, data_visita, id_empresa, parecer_geral ?? null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar ficha de acompanhamento.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id_pessoa_aluno, data_admissao, data_visita, id_empresa, parecer_geral } = req.body;

  if (!id_pessoa_aluno || !data_visita || !id_empresa) {
    return res.status(400).json({
      error: "Campos obrigatorios: id_pessoa_aluno, data_visita, id_empresa.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE ficha_acompanhamento SET
        id_pessoa_aluno = $1,
        data_admissao = $2,
        data_visita = $3,
        id_empresa = $4,
        parecer_geral = $5
      WHERE id = $6
      RETURNING *`,
      [id_pessoa_aluno, data_admissao ?? null, data_visita, id_empresa, parecer_geral ?? null, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ficha de acompanhamento nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar ficha de acompanhamento.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM ficha_acompanhamento WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ficha de acompanhamento nao encontrada." });
    }
    return res.json({ message: "Ficha de acompanhamento removida com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover ficha de acompanhamento.", details: error.message });
  }
});

export default router;

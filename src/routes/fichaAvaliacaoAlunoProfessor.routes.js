import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ficha_avaliacao_aluno_professor ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar fichas de avaliacao aluno/professor.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ficha_avaliacao_aluno_professor WHERE id = $1",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ficha de avaliacao aluno/professor nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar ficha de avaliacao aluno/professor.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, tipo_avaliacao, id_pessoa_aluno, data_entrada, data_avaliacao, id_pessoa_professor } = req.body;

  if (!id || !tipo_avaliacao || !id_pessoa_aluno || !data_avaliacao || !id_pessoa_professor) {
    return res.status(400).json({
      error: "Campos obrigatorios: id, tipo_avaliacao, id_pessoa_aluno, data_avaliacao, id_pessoa_professor.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ficha_avaliacao_aluno_professor (
        id, tipo_avaliacao, id_pessoa_aluno, data_entrada, data_avaliacao, id_pessoa_professor
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [id, tipo_avaliacao, id_pessoa_aluno, data_entrada ?? null, data_avaliacao, id_pessoa_professor]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar ficha de avaliacao aluno/professor.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { tipo_avaliacao, id_pessoa_aluno, data_entrada, data_avaliacao, id_pessoa_professor } = req.body;

  if (!tipo_avaliacao || !id_pessoa_aluno || !data_avaliacao || !id_pessoa_professor) {
    return res.status(400).json({
      error: "Campos obrigatorios: tipo_avaliacao, id_pessoa_aluno, data_avaliacao, id_pessoa_professor.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE ficha_avaliacao_aluno_professor SET
        tipo_avaliacao = $1,
        id_pessoa_aluno = $2,
        data_entrada = $3,
        data_avaliacao = $4,
        id_pessoa_professor = $5
      WHERE id = $6
      RETURNING *`,
      [tipo_avaliacao, id_pessoa_aluno, data_entrada ?? null, data_avaliacao, id_pessoa_professor, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ficha de avaliacao aluno/professor nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar ficha de avaliacao aluno/professor.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM ficha_avaliacao_aluno_professor WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ficha de avaliacao aluno/professor nao encontrada." });
    }
    return res.json({ message: "Ficha de avaliacao aluno/professor removida com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover ficha de avaliacao aluno/professor.", details: error.message });
  }
});

export default router;

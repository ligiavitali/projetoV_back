import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ficha_avaliacao_questionario ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar questionarios de avaliacao.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ficha_avaliacao_questionario WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Questionario de avaliacao nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar questionario de avaliacao.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, id_item, id_ficha_avaliacao_aluno_prof, resultado, campo_pergunta1, campo_pergunta2 } = req.body;

  if (!id || !id_item || !id_ficha_avaliacao_aluno_prof) {
    return res.status(400).json({
      error: "Campos obrigatorios: id, id_item, id_ficha_avaliacao_aluno_prof.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ficha_avaliacao_questionario (
        id, id_item, id_ficha_avaliacao_aluno_prof, resultado, campo_pergunta1, campo_pergunta2
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        id,
        id_item,
        id_ficha_avaliacao_aluno_prof,
        resultado ?? null,
        campo_pergunta1 ?? null,
        campo_pergunta2 ?? null,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar questionario de avaliacao.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id_item, id_ficha_avaliacao_aluno_prof, resultado, campo_pergunta1, campo_pergunta2 } = req.body;

  if (!id_item || !id_ficha_avaliacao_aluno_prof) {
    return res.status(400).json({
      error: "Campos obrigatorios: id_item, id_ficha_avaliacao_aluno_prof.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE ficha_avaliacao_questionario SET
        id_item = $1,
        id_ficha_avaliacao_aluno_prof = $2,
        resultado = $3,
        campo_pergunta1 = $4,
        campo_pergunta2 = $5
      WHERE id = $6
      RETURNING *`,
      [
        id_item,
        id_ficha_avaliacao_aluno_prof,
        resultado ?? null,
        campo_pergunta1 ?? null,
        campo_pergunta2 ?? null,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Questionario de avaliacao nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar questionario de avaliacao.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM ficha_avaliacao_questionario WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Questionario de avaliacao nao encontrado." });
    }
    return res.json({ message: "Questionario de avaliacao removido com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover questionario de avaliacao.", details: error.message });
  }
});

export default router;

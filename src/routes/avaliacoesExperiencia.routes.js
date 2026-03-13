import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

const normalizeTipo = (tipo) => String(tipo || "").trim().toLowerCase();

const normalizePayload = (payload = {}) => {
  const tipo = normalizeTipo(payload.tipo);
  const nome = payload.nome ? String(payload.nome).trim() : null;
  const formData = payload.formData && typeof payload.formData === "object" ? payload.formData : {};
  const questoes = Array.isArray(payload.questoes) ? payload.questoes : [];

  return {
    tipo,
    nome,
    formData,
    questoes,
  };
};

const mapRow = (row) => ({
  id: row.id,
  tipo: row.tipo,
  nome: row.nome,
  formData: row.formData || {},
  questoes: Array.isArray(row.questoes) ? row.questoes : [],
  criadoEm: row.criadoEm,
  atualizadoEm: row.atualizadoEm,
});

router.get("/", async (req, res) => {
  const tipo = normalizeTipo(req.query.tipo);

  try {
    const values = [];
    let whereClause = "";

    if (tipo) {
      values.push(tipo);
      whereClause = "WHERE tipo = $1";
    }

    const result = await pool.query(
      `SELECT
        id,
        tipo,
        nome,
        form_data AS "formData",
        questoes,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"
      FROM avaliacoes_experiencia
      ${whereClause}
      ORDER BY id DESC`,
      values
    );

    return res.json(result.rows.map(mapRow));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar avaliacoes de experiencia.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        tipo,
        nome,
        form_data AS "formData",
        questoes,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"
      FROM avaliacoes_experiencia
      WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Avaliacao nao encontrada." });
    }

    return res.json(mapRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar avaliacao.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const payload = normalizePayload(req.body);

  if (!payload.tipo) {
    return res.status(400).json({ error: "Campo obrigatorio: tipo." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO avaliacoes_experiencia (tipo, nome, form_data, questoes, criado_em, atualizado_em)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, NOW(), NOW())
       RETURNING
        id,
        tipo,
        nome,
        form_data AS "formData",
        questoes,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"`,
      [payload.tipo, payload.nome, JSON.stringify(payload.formData), JSON.stringify(payload.questoes)]
    );

    return res.status(201).json(mapRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar avaliacao.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const payload = normalizePayload(req.body);

  if (!payload.tipo) {
    return res.status(400).json({ error: "Campo obrigatorio: tipo." });
  }

  try {
    const result = await pool.query(
      `UPDATE avaliacoes_experiencia
       SET tipo = $1,
           nome = $2,
           form_data = $3::jsonb,
           questoes = $4::jsonb,
           atualizado_em = NOW()
       WHERE id = $5
       RETURNING
        id,
        tipo,
        nome,
        form_data AS "formData",
        questoes,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"`,
      [payload.tipo, payload.nome, JSON.stringify(payload.formData), JSON.stringify(payload.questoes), req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Avaliacao nao encontrada." });
    }

    return res.json(mapRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar avaliacao.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM avaliacoes_experiencia WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Avaliacao nao encontrada." });
    }

    return res.json({ message: "Avaliacao removida com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover avaliacao.", details: error.message });
  }
});

export default router;

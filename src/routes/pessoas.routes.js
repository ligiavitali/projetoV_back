import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pessoas ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar pessoas.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pessoas WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Pessoa nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar pessoa.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    nome,
    email,
    telefone,
    cpf,
    perfil,
    data_ingresso,
    data_nascimento,
    nome_responsavel,
    telefone_responsavel,
    usa_medicamento,
    info_medicamentos,
    status,
  } = req.body;

  if (!nome || !email || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: nome, email, status." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pessoas (
        nome, email, telefone, cpf, perfil, data_ingresso, data_nascimento,
        nome_responsavel, telefone_responsavel, usa_medicamento, info_medicamentos, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        nome,
        email,
        telefone ?? null,
        cpf ?? null,
        perfil ?? null,
        data_ingresso ?? null,
        data_nascimento ?? null,
        nome_responsavel ?? null,
        telefone_responsavel ?? null,
        usa_medicamento ?? null,
        info_medicamentos ?? null,
        status,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar pessoa.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const {
    nome,
    email,
    telefone,
    cpf,
    perfil,
    data_ingresso,
    data_nascimento,
    nome_responsavel,
    telefone_responsavel,
    usa_medicamento,
    info_medicamentos,
    status,
  } = req.body;

  if (!nome || !email || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: nome, email, status." });
  }

  try {
    const result = await pool.query(
      `UPDATE pessoas SET
        nome = $1,
        email = $2,
        telefone = $3,
        cpf = $4,
        perfil = $5,
        data_ingresso = $6,
        data_nascimento = $7,
        nome_responsavel = $8,
        telefone_responsavel = $9,
        usa_medicamento = $10,
        info_medicamentos = $11,
        status = $12
      WHERE id = $13
      RETURNING *`,
      [
        nome,
        email,
        telefone ?? null,
        cpf ?? null,
        perfil ?? null,
        data_ingresso ?? null,
        data_nascimento ?? null,
        nome_responsavel ?? null,
        telefone_responsavel ?? null,
        usa_medicamento ?? null,
        info_medicamentos ?? null,
        status,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Pessoa nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar pessoa.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM pessoas WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Pessoa nao encontrada." });
    }
    return res.json({ message: "Pessoa removida com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover pessoa.", details: error.message });
  }
});

export default router;

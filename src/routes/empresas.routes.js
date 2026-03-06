import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empresas ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar empresas.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empresas WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empresa nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar empresa.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    id,
    nome_fantasia,
    razao_social,
    cnpj,
    endereco,
    telefone,
    nome_responsavel_rh,
    email_responsavel_rh,
    status,
  } = req.body;

  if (!id || !razao_social || !cnpj || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: id, razao_social, cnpj, status." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO empresas (
        id, nome_fantasia, razao_social, cnpj, endereco, telefone,
        nome_responsavel_rh, email_responsavel_rh, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        id,
        nome_fantasia ?? null,
        razao_social,
        cnpj,
        endereco ?? null,
        telefone ?? null,
        nome_responsavel_rh ?? null,
        email_responsavel_rh ?? null,
        status,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar empresa.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const {
    nome_fantasia,
    razao_social,
    cnpj,
    endereco,
    telefone,
    nome_responsavel_rh,
    email_responsavel_rh,
    status,
  } = req.body;

  if (!razao_social || !cnpj || !status) {
    return res.status(400).json({ error: "Campos obrigatorios: razao_social, cnpj, status." });
  }

  try {
    const result = await pool.query(
      `UPDATE empresas SET
        nome_fantasia = $1,
        razao_social = $2,
        cnpj = $3,
        endereco = $4,
        telefone = $5,
        nome_responsavel_rh = $6,
        email_responsavel_rh = $7,
        status = $8
      WHERE id = $9
      RETURNING *`,
      [
        nome_fantasia ?? null,
        razao_social,
        cnpj,
        endereco ?? null,
        telefone ?? null,
        nome_responsavel_rh ?? null,
        email_responsavel_rh ?? null,
        status,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empresa nao encontrada." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar empresa.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM empresas WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empresa nao encontrada." });
    }
    return res.json({ message: "Empresa removida com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover empresa.", details: error.message });
  }
});

export default router;

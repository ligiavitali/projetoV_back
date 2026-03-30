import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

const normalizeUsuarios = (usuarios) => {
  if (!Array.isArray(usuarios)) {
    return [];
  }

  return usuarios.map((usuario) => ({
    id: usuario?.id,
    numero: usuario?.numero || "",
    id_pessoa_aluno: usuario?.id_pessoa_aluno || "",
    nome: usuario?.nome || "",
    dataAdmissao: usuario?.dataAdmissao || "",
    id_empresa: usuario?.id_empresa || "",
    empresa: usuario?.empresa || "",
    funcao: usuario?.funcao || "",
    contatoRH: usuario?.contatoRH || "",
    dataEncaminhamento: usuario?.dataEncaminhamento || "",
    provavelDataDesligamento: usuario?.provavelDataDesligamento || "",
    statusEncaminhamento: usuario?.statusEncaminhamento || "ativo",
  }));
};

const mapRow = (row) => ({
  id: row.id,
  anoReferencia: row.anoReferencia,
  dataEncaminhamento: row.dataEncaminhamento,
  usuarios: Array.isArray(row.usuarios) ? row.usuarios : [],
  criadoEm: row.criadoEm,
  atualizadoEm: row.atualizadoEm,
});

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        ano_referencia AS "anoReferencia",
        data_encaminhamento AS "dataEncaminhamento",
        usuarios,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"
      FROM listas_encaminhados
      ORDER BY id DESC`
    );

    return res.json(result.rows.map(mapRow));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar encaminhados.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        ano_referencia AS "anoReferencia",
        data_encaminhamento AS "dataEncaminhamento",
        usuarios,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"
      FROM listas_encaminhados
      WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Lista nao encontrada." });
    }

    return res.json(mapRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar lista.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const anoReferencia = String(req.body?.anoReferencia || "").trim();
  const dataEncaminhamento = req.body?.dataEncaminhamento || null;
  const usuarios = normalizeUsuarios(req.body?.usuarios);

  if (usuarios.length === 0) {
    return res.status(400).json({ error: "Informe ao menos um usuario." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listas_encaminhados (ano_referencia, data_encaminhamento, usuarios, criado_em, atualizado_em)
       VALUES ($1, $2, $3::jsonb, NOW(), NOW())
       RETURNING
        id,
        ano_referencia AS "anoReferencia",
        data_encaminhamento AS "dataEncaminhamento",
        usuarios,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"`,
      [anoReferencia, dataEncaminhamento, JSON.stringify(usuarios)]
    );

    return res.status(201).json(mapRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar lista.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const anoReferencia = String(req.body?.anoReferencia || "").trim();
  const dataEncaminhamento = req.body?.dataEncaminhamento || null;
  const usuarios = normalizeUsuarios(req.body?.usuarios);

  if (usuarios.length === 0) {
    return res.status(400).json({ error: "Informe ao menos um usuario." });
  }

  try {
    const result = await pool.query(
      `UPDATE listas_encaminhados
       SET ano_referencia = $1,
           data_encaminhamento = $2,
           usuarios = $3::jsonb,
           atualizado_em = NOW()
       WHERE id = $4
       RETURNING
        id,
        ano_referencia AS "anoReferencia",
        data_encaminhamento AS "dataEncaminhamento",
        usuarios,
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"`,
      [anoReferencia, dataEncaminhamento, JSON.stringify(usuarios), req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Lista nao encontrada." });
    }

    return res.json(mapRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar lista.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM listas_encaminhados WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Lista nao encontrada." });
    }

    return res.json({ message: "Lista removida com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover lista.", details: error.message });
  }
});

export default router;

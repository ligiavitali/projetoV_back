import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lista_encaminhados ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar encaminhados.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lista_encaminhados WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Registro de encaminhamento nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar registro de encaminhamento.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, id_pessoa_aluno, data_entrada, id_empresa, id_funcao, provavel_data_desligamento_ieedf } = req.body;

  if (!id || !id_pessoa_aluno || !id_empresa) {
    return res.status(400).json({ error: "Campos obrigatorios: id, id_pessoa_aluno, id_empresa." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lista_encaminhados (
        id, id_pessoa_aluno, data_entrada, id_empresa, id_funcao, provavel_data_desligamento_ieedf
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        id,
        id_pessoa_aluno,
        data_entrada ?? null,
        id_empresa,
        id_funcao ?? null,
        provavel_data_desligamento_ieedf ?? null,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar registro de encaminhamento.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id_pessoa_aluno, data_entrada, id_empresa, id_funcao, provavel_data_desligamento_ieedf } = req.body;

  if (!id_pessoa_aluno || !id_empresa) {
    return res.status(400).json({ error: "Campos obrigatorios: id_pessoa_aluno, id_empresa." });
  }

  try {
    const result = await pool.query(
      `UPDATE lista_encaminhados SET
        id_pessoa_aluno = $1,
        data_entrada = $2,
        id_empresa = $3,
        id_funcao = $4,
        provavel_data_desligamento_ieedf = $5
      WHERE id = $6
      RETURNING *`,
      [
        id_pessoa_aluno,
        data_entrada ?? null,
        id_empresa,
        id_funcao ?? null,
        provavel_data_desligamento_ieedf ?? null,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Registro de encaminhamento nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar registro de encaminhamento.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM lista_encaminhados WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Registro de encaminhamento nao encontrado." });
    }
    return res.json({ message: "Registro de encaminhamento removido com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover registro de encaminhamento.", details: error.message });
  }
});

export default router;

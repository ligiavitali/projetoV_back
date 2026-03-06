import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM controle_interno_avaliacao_usuarios ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar controle interno de avaliacao de usuarios.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM controle_interno_avaliacao_usuarios WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Registro de controle interno nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar registro de controle interno.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    id,
    id_pessoa_aluno,
    data_entrada,
    dt_1_avaliacao,
    dt_2_avaliacao,
    dt_1_entrevista_pais,
    dt_2_entrevista_pais,
    resultado,
  } = req.body;

  if (!id || !id_pessoa_aluno) {
    return res.status(400).json({ error: "Campos obrigatorios: id, id_pessoa_aluno." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO controle_interno_avaliacao_usuarios (
        id, id_pessoa_aluno, data_entrada, dt_1_avaliacao, dt_2_avaliacao,
        dt_1_entrevista_pais, dt_2_entrevista_pais, resultado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        id,
        id_pessoa_aluno,
        data_entrada ?? null,
        dt_1_avaliacao ?? null,
        dt_2_avaliacao ?? null,
        dt_1_entrevista_pais ?? null,
        dt_2_entrevista_pais ?? null,
        resultado ?? null,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar registro de controle interno.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const {
    id_pessoa_aluno,
    data_entrada,
    dt_1_avaliacao,
    dt_2_avaliacao,
    dt_1_entrevista_pais,
    dt_2_entrevista_pais,
    resultado,
  } = req.body;

  if (!id_pessoa_aluno) {
    return res.status(400).json({ error: "Campo obrigatorio: id_pessoa_aluno." });
  }

  try {
    const result = await pool.query(
      `UPDATE controle_interno_avaliacao_usuarios SET
        id_pessoa_aluno = $1,
        data_entrada = $2,
        dt_1_avaliacao = $3,
        dt_2_avaliacao = $4,
        dt_1_entrevista_pais = $5,
        dt_2_entrevista_pais = $6,
        resultado = $7
      WHERE id = $8
      RETURNING *`,
      [
        id_pessoa_aluno,
        data_entrada ?? null,
        dt_1_avaliacao ?? null,
        dt_2_avaliacao ?? null,
        dt_1_entrevista_pais ?? null,
        dt_2_entrevista_pais ?? null,
        resultado ?? null,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Registro de controle interno nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar registro de controle interno.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM controle_interno_avaliacao_usuarios WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Registro de controle interno nao encontrado." });
    }
    return res.json({ message: "Registro de controle interno removido com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover registro de controle interno.", details: error.message });
  }
});

export default router;

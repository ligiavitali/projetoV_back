import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, email, token_recuperacao, validade_token, nivel_acesso FROM usuarios ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuarios.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, email, token_recuperacao, validade_token, nivel_acesso FROM usuarios WHERE id = $1",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuario.", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, nome, email, senha_hash, senha, token_recuperacao, validade_token, nivel_acesso } = req.body;

  if (!id || !nome || !email || !(senha_hash || senha)) {
    return res.status(400).json({ error: "Campos obrigatorios: id, nome, email, senha_hash (ou senha)." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (
        id, nome, email, senha_hash, token_recuperacao, validade_token, nivel_acesso
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, nome, email, token_recuperacao, validade_token, nivel_acesso`,
      [
        id,
        nome,
        email,
        senha_hash ?? senha,
        token_recuperacao ?? null,
        validade_token ?? null,
        nivel_acesso ?? null,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar usuario.", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, email, senha_hash, senha, token_recuperacao, validade_token, nivel_acesso } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Campos obrigatorios: nome, email." });
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios SET
        nome = $1,
        email = $2,
        senha_hash = COALESCE($3, senha_hash),
        token_recuperacao = $4,
        validade_token = $5,
        nivel_acesso = $6
      WHERE id = $7
      RETURNING id, nome, email, token_recuperacao, validade_token, nivel_acesso`,
      [
        nome,
        email,
        senha_hash ?? senha ?? null,
        token_recuperacao ?? null,
        validade_token ?? null,
        nivel_acesso ?? null,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar usuario.", details: error.message });
  }
});

router.patch("/:id/ativo", async (_req, res) => {
  return res.status(400).json({ error: "A tabela usuarios nao possui campo ativo." });
});

router.post("/:id/resetar-senha", async (req, res) => {
  const { senha } = req.body;
  if (!senha) {
    return res.status(400).json({ error: "Informe a nova senha." });
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios
      SET senha_hash = $1, token_recuperacao = NULL, validade_token = NULL
      WHERE id = $2
      RETURNING id, nome, email, token_recuperacao, validade_token, nivel_acesso`,
      [senha, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao resetar senha.", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario nao encontrado." });
    }
    return res.json({ message: "Usuario removido com sucesso.", id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover usuario.", details: error.message });
  }
});

export default router;

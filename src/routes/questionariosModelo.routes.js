import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

const normalizeTipo = (tipo) => String(tipo || "").trim().toLowerCase();

const normalizeQuestoes = (questoes) => {
  if (!Array.isArray(questoes)) {
    return [];
  }

  return questoes
    .map((questao) => ({
      id: String(questao?.id || "").trim(),
      texto: String(questao?.texto || "").trim(),
      tipo: questao?.tipo === "texto" ? "texto" : "opcao",
    }))
    .filter((questao) => questao.id.length > 0 && questao.texto.length > 0);
};

const getQuestoesPadraoDosItens = async () => {
  const result = await pool.query(
    `SELECT id, itens
     FROM itens_avaliacao
     WHERE status = 'ativo'
     ORDER BY id`
  );

  return result.rows.map((item) => ({ id: String(item.id), texto: item.itens, tipo: "opcao" }));
};

router.get("/:tipo", async (req, res) => {
  const tipo = normalizeTipo(req.params.tipo);

  if (!tipo) {
    return res.status(400).json({ error: "Tipo de questionario invalido." });
  }

  try {
    const result = await pool.query(
      "SELECT tipo, questoes, atualizado_em FROM questionarios_modelo WHERE tipo = $1",
      [tipo]
    );

    if (result.rowCount === 0) {
      const questoesPadrao = await getQuestoesPadraoDosItens();
      return res.json({
        tipo,
        questoes: questoesPadrao,
        atualizado_em: null,
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao buscar modelo de questionario.",
      details: error.message,
    });
  }
});

router.put("/:tipo", async (req, res) => {
  const tipo = normalizeTipo(req.params.tipo);
  const questoes = normalizeQuestoes(req.body?.questoes);

  if (!tipo) {
    return res.status(400).json({ error: "Tipo de questionario invalido." });
  }

  if (questoes.length === 0) {
    return res.status(400).json({ error: "Informe ao menos uma questao valida." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO questionarios_modelo (tipo, questoes, atualizado_em)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (tipo)
       DO UPDATE SET questoes = EXCLUDED.questoes, atualizado_em = NOW()
       RETURNING tipo, questoes, atualizado_em`,
      [tipo, JSON.stringify(questoes)]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao salvar modelo de questionario.",
      details: error.message,
    });
  }
});

export default router;

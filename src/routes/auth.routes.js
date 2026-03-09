import { Router } from "express";
import crypto from "crypto";
import { pool } from "../db.js";
import { canSendEmail, sendRecoveryEmail } from "../services/emailService.js";

const router = Router();

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Informe o e-mail para recuperação." });
  }

  try {
    const userResult = await pool.query(
      "SELECT id FROM usuarios WHERE lower(email) = lower($1)",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.json({ message: "Se o e-mail existir, um link de recuperação foi gerado." });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const validade = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `UPDATE usuarios
      SET token_recuperacao = $1, validade_token = $2
      WHERE id = $3`,
      [token, validade, userResult.rows[0].id]
    );

    const frontendUrl = process.env.APP_FRONTEND_URL || "http://localhost:5173";
    const recoveryUrl = `${frontendUrl}/recuperar-senha?token=${token}`;

    if (canSendEmail()) {
      await sendRecoveryEmail({ to: email, recoveryUrl });
      return res.json({ message: "E-mail de recuperação enviado com sucesso." });
    }

    return res.json({
      message: "SMTP nao configurado. Link de recuperação gerado para uso local.",
      recoveryUrl,
      token,
      expiresAt: validade,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao solicitar recuperação de senha.",
      details: error.message,
    });
  }
});

router.post("/recuperar", async (req, res) => {
  const token = req.query.token || req.body?.token;
  const { novaSenha } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token de recuperação é obrigatório." });
  }

  if (!novaSenha || String(novaSenha).length < 6) {
    return res.status(400).json({ error: "A nova senha deve ter no mínimo 6 caracteres." });
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios
      SET senha_hash = $1, token_recuperacao = NULL, validade_token = NULL
      WHERE token_recuperacao = $2 AND validade_token IS NOT NULL AND validade_token > NOW()
      RETURNING id, nome, email`,
      [novaSenha, token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    return res.json({ message: "Senha alterada com sucesso.", user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao redefinir senha.", details: error.message });
  }
});

export default router;

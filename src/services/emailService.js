import nodemailer from "nodemailer";

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: toBool(process.env.SMTP_SECURE, false),
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
};

const hasSmtpConfig = Boolean(smtpConfig.host && smtpConfig.auth?.user && smtpConfig.auth?.pass);

const transporter = hasSmtpConfig ? nodemailer.createTransport(smtpConfig) : null;

export const canSendEmail = () => Boolean(transporter);

export const sendRecoveryEmail = async ({ to, recoveryUrl }) => {
  if (!transporter) {
    throw new Error("SMTP nao configurado.");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Recuperacao de senha - ProjetoV",
    text: `Voce solicitou recuperacao de senha. Acesse o link: ${recoveryUrl}`,
    html: `
      <p>Voce solicitou recuperacao de senha.</p>
      <p>Clique no link para redefinir sua senha:</p>
      <p><a href="${recoveryUrl}">${recoveryUrl}</a></p>
      <p>Este link expira em 1 hora.</p>
    `,
  });
};

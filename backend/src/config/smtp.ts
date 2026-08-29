import "dotenv/config";

export const smtpConfig = {
  host: process.env.SMTP_HOST ?? "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT ?? 587),
  user: process.env.SMTP_USER ?? "",
  password: process.env.SMTP_PASSWORD ?? "",
};
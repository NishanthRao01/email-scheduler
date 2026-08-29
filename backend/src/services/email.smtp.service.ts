import nodemailer from "nodemailer";

import { smtpConfig } from "../config/smtp.ts";

const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.port === 465,
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.password,
  },
});

export interface SendEmailInput {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async ({
  from,
  to,
  subject,
  text,
}: SendEmailInput) => {
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });

  return info;
};
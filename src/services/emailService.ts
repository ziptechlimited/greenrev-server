import nodemailer from "nodemailer";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

function getTransport() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    if (env.nodeEnv !== "production") {
      return null;
    }
    throw new ApiError(500, "EMAIL_NOT_CONFIGURED", "Email provider not configured");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const transport = getTransport();
  if (!transport) return;
  await transport.sendMail({
    from: env.smtpFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}

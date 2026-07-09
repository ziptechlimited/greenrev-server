import nodemailer from "nodemailer";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

function getTransport() {
  console.log("Checking email service configuration variables...");
  console.log("Configuration status:", {
    nodeEnv: env.nodeEnv,
    smtpHost: env.smtpHost || "MISSING",
    smtpPort: env.smtpPort,
    smtpUser: env.smtpUser || "MISSING",
    smtpFrom: env.smtpFrom || "MISSING",
    smtpPassProvided: !!env.smtpPass,
  });

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    if (env.nodeEnv !== "production") {
      console.warn("Skipping email transporter creation because environment variables are not fully configured in non-production mode.");
      return null;
    }
    const errorMsg = "Email provider credentials or hosts are missing in production environment variables!";
    console.error(errorMsg);
    throw new ApiError(500, "EMAIL_NOT_CONFIGURED", errorMsg);
  }

  console.log(`Initializing nodemailer SMTP transport. Host: ${env.smtpHost}, Port: ${env.smtpPort}, Secure (SSL/TLS): ${env.smtpPort === 465}`);
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn(`[SKIP] Mail not sent to ${input.to} because mail transport is not configured.`);
    return;
  }

  console.log(`[EMAIL SENDING] Preparing to send email to: ${input.to}, Subject: "${input.subject}"`);
  try {
    const info = await transport.sendMail({
      from: env.smtpFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    console.log(`[EMAIL SUCCESS] Mail sent to ${input.to} successfully. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${input.to}. Error message: ${(error as Error).message}`);
    console.error("[EMAIL ERROR STACK]", error);
    throw new ApiError(
      500,
      "EMAIL_SEND_FAILED",
      `Failed to send email to ${input.to}: ${(error as Error).message}`
    );
  }
}

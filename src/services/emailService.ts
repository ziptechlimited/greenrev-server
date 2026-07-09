import { Resend } from "resend";
import nodemailer from "nodemailer";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

let resendInstance: Resend | null = null;
if (env.resendApiKey) {
  console.log("Resend API key detected. Email service will use Resend.");
  resendInstance = new Resend(env.resendApiKey);
} else {
  console.log("No Resend API key found. Falling back to SMTP configuration.");
}

function getSmtpTransport() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  // 1. Try Resend if configured
  if (resendInstance) {
    const fromAddress = env.smtpFrom || "onboarding@resend.dev";
    console.log(`[EMAIL SENDING - RESEND] Sending to: ${input.to}, From: ${fromAddress}, Subject: "${input.subject}"`);
    try {
      const { data, error } = await resendInstance.emails.send({
        from: fromAddress,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });

      if (error) {
        console.error(`[EMAIL ERROR - RESEND] API returned error details:`, error);
        throw new Error(error.message);
      }

      console.log(`[EMAIL SUCCESS - RESEND] Mail sent to ${input.to} successfully. ID: ${data?.id}`);
      return;
    } catch (err) {
      console.error(`[EMAIL ERROR - RESEND] Failed to send email to ${input.to}. Error:`, err);
      throw new ApiError(
        500,
        "EMAIL_SEND_FAILED",
        `Resend failed: ${(err as Error).message}`
      );
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const smtpTransport = getSmtpTransport();
  if (smtpTransport) {
    console.log(`[EMAIL SENDING - SMTP] Sending to: ${input.to}, Subject: "${input.subject}"`);
    try {
      const info = await smtpTransport.sendMail({
        from: env.smtpFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
      console.log(`[EMAIL SUCCESS - SMTP] Mail sent to ${input.to} successfully. Message ID: ${info.messageId}`);
      return;
    } catch (err) {
      console.error(`[EMAIL ERROR - SMTP] Failed to send email to ${input.to}. Error:`, err);
      throw new ApiError(
        500,
        "EMAIL_SEND_FAILED",
        `SMTP failed: ${(err as Error).message}`
      );
    }
  }

  // 3. No service configured
  if (env.nodeEnv !== "production") {
    console.warn(`[SKIP] Mail not sent to ${input.to} (No email service configured in non-production)`);
    return;
  }

  const errorMsg = "Neither Resend nor SMTP is configured in production environment variables!";
  console.error(errorMsg);
  throw new ApiError(500, "EMAIL_NOT_CONFIGURED", errorMsg);
}

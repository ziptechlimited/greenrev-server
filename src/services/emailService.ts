import { Resend } from "resend";
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
  console.warn("No Resend API key found.");
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (resendInstance) {
    const fromAddress = env.emailFrom || "onboarding@resend.dev";
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

  // If Resend is not configured
  if (env.nodeEnv !== "production") {
    console.warn(`[SKIP] Mail not sent to ${input.to} (Resend is not configured in non-production)`);
    return;
  }

  const errorMsg = "Resend API key is not configured in production environment variables!";
  console.error(errorMsg);
  throw new ApiError(500, "EMAIL_NOT_CONFIGURED", errorMsg);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
let resendInstance = null;
if (env_1.env.resendApiKey) {
    console.log("Resend API key detected. Email service will use Resend.");
    resendInstance = new resend_1.Resend(env_1.env.resendApiKey);
}
else {
    console.warn("No Resend API key found.");
}
async function sendEmail(input) {
    if (resendInstance) {
        const fromAddress = env_1.env.emailFrom || "onboarding@resend.dev";
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
        }
        catch (err) {
            console.error(`[EMAIL ERROR - RESEND] Failed to send email to ${input.to}. Error:`, err);
            throw new errors_1.ApiError(500, "EMAIL_SEND_FAILED", `Resend failed: ${err.message}`);
        }
    }
    // If Resend is not configured
    if (env_1.env.nodeEnv !== "production") {
        console.warn(`[SKIP] Mail not sent to ${input.to} (Resend is not configured in non-production)`);
        return;
    }
    const errorMsg = "Resend API key is not configured in production environment variables!";
    console.error(errorMsg);
    throw new errors_1.ApiError(500, "EMAIL_NOT_CONFIGURED", errorMsg);
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function getTransport() {
    if (!env_1.env.smtpHost || !env_1.env.smtpUser || !env_1.env.smtpPass || !env_1.env.smtpFrom) {
        if (env_1.env.nodeEnv !== "production") {
            return null;
        }
        throw new errors_1.ApiError(500, "EMAIL_NOT_CONFIGURED", "Email provider not configured");
    }
    return nodemailer_1.default.createTransport({
        host: env_1.env.smtpHost,
        port: env_1.env.smtpPort,
        secure: env_1.env.smtpPort === 465,
        auth: { user: env_1.env.smtpUser, pass: env_1.env.smtpPass },
    });
}
async function sendEmail(input) {
    const transport = getTransport();
    if (!transport)
        return;
    await transport.sendMail({
        from: env_1.env.smtpFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
    });
}

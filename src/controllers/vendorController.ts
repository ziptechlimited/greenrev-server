import type { Response } from "express";
import mongoose from "mongoose";
import { VendorMessage } from "../models/VendorMessage";
import { User } from "../models/User";
import { Product } from "../models/Product";
import type { CustomReq } from "../types/auth";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { sendEmail } from "../services/emailService";

// ─── Customer: Send a message to a vendor ─────────────────────────────────────
export async function createVendorMessage(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHENTICATED", message: "Login required to send a message" });
    }

    const vendorId = req.params.id as string;
    const { message, productId } = req.body as { message?: string; productId?: string };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return sendError(res, 400, { code: "INVALID_INPUT", message: "Message cannot be empty" });
    }

    const vendor = await User.findById(vendorId).lean();
    if (!vendor || vendor.role !== "vendor") {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Vendor not found" });
    }

    const sender = await User.findById(req.user.id).lean();
    if (!sender) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Sender not found" });
    }

    const senderName = (sender.name as string | null) ?? (sender.email as string);
    const senderEmail = sender.email as string;
    const senderPhone = sender.phone as string | undefined;

    // Optionally look up product context
    let productName: string | undefined;
    if (productId) {
      const product = await Product.findById(productId).lean();
      if (product) productName = product.name as string;
    }

    const vendorMessage = await VendorMessage.create({
      vendorId: new mongoose.Types.ObjectId(vendorId),
      senderId: sender._id,
      senderName,
      senderEmail,
      senderPhone,
      productId: productId ? new mongoose.Types.ObjectId(productId) : undefined,
      productName,
      message: message.trim(),
    });

    // Send email notification to vendor
    if (vendor.email) {
      const productLine = productName ? `<p><strong>Regarding:</strong> ${productName}</p>` : "";
      const emailHtml = `
        <h2>New Message from ${senderName}</h2>
        <p>You have received a new message on your GreenRev vendor profile.</p>
        ${productLine}
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p>${message.trim()}</p>
        </div>
        <p><strong>Contact Details:</strong></p>
        <ul>
          <li>Name: ${senderName}</li>
          <li>Email: ${senderEmail}</li>
          ${senderPhone ? `<li>Phone: ${senderPhone}</li>` : ""}
        </ul>
        <p>Log in to your vendor dashboard to respond or manage your messages.</p>
      `;

      await sendEmail({
        to: vendor.email as string,
        subject: `New Message from ${senderName} - GreenRev`,
        html: emailHtml,
      }).catch((err) => console.error("Failed to send vendor message email:", err));
    }

    return sendSuccess(res, 201, { message: vendorMessage });
  } catch (error) {
    console.error("Create vendor message error:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to send message" });
  }
}

// ─── Vendor: Get incoming messages ────────────────────────────────────────────
export async function getVendorMessages(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHENTICATED", message: "Authentication required" });
    }

    const messages = await VendorMessage.find({ vendorId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, { messages });
  } catch (error) {
    console.error("Get vendor messages error:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to load messages" });
  }
}

import type { Response } from "express";
import { Message } from "../models/Message";
import { AcquisitionRequest } from "../models/AcquisitionRequest";
import type { CustomReq } from "../types/auth";

export async function getMessages(req: CustomReq, res: Response) {
  try {
    const acquisitionId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const acquisition = await AcquisitionRequest.findById(acquisitionId);
    if (!acquisition) {
      return res.status(404).json({ success: false, message: "Acquisition request not found" });
    }

    if (
      acquisition.customerId.toString() !== userId &&
      acquisition.vendorId.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ acquisitionId }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error getting messages:", error);
    return res.status(500).json({ success: false, message: "Failed to load messages" });
  }
}

export async function sendMessage(req: CustomReq, res: Response) {
  try {
    const acquisitionId = req.params.id;
    const userId = req.user?.id;
    const { text } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const acquisition = await AcquisitionRequest.findById(acquisitionId);
    if (!acquisition) {
      return res.status(404).json({ success: false, message: "Acquisition request not found" });
    }

    let senderName = "";
    if (acquisition.customerId.toString() === userId) {
      senderName = acquisition.customerName;
    } else if (acquisition.vendorId.toString() === userId) {
      senderName = acquisition.vendorName;
    } else {
      return res.status(403).json({ success: false, message: "Not authorized to send messages here" });
    }

    const newMessage = await Message.create({
      acquisitionId: acquisitionId as any,
      senderId: userId as any,
      senderName,
      text: text.trim(),
    });

    return res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
}

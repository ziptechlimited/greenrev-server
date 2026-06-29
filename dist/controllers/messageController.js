"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
const Message_1 = require("../models/Message");
const AcquisitionRequest_1 = require("../models/AcquisitionRequest");
async function getMessages(req, res) {
    try {
        const acquisitionId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const acquisition = await AcquisitionRequest_1.AcquisitionRequest.findById(acquisitionId);
        if (!acquisition) {
            return res.status(404).json({ success: false, message: "Acquisition request not found" });
        }
        if (acquisition.customerId.toString() !== userId &&
            acquisition.vendorId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to view these messages" });
        }
        const messages = await Message_1.Message.find({ acquisitionId }).sort({ createdAt: 1 });
        return res.status(200).json({ success: true, data: messages });
    }
    catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).json({ success: false, message: "Failed to load messages" });
    }
}
async function sendMessage(req, res) {
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
        const acquisition = await AcquisitionRequest_1.AcquisitionRequest.findById(acquisitionId);
        if (!acquisition) {
            return res.status(404).json({ success: false, message: "Acquisition request not found" });
        }
        let senderName = "";
        if (acquisition.customerId.toString() === userId) {
            senderName = acquisition.customerName;
        }
        else if (acquisition.vendorId.toString() === userId) {
            senderName = acquisition.vendorName;
        }
        else {
            return res.status(403).json({ success: false, message: "Not authorized to send messages here" });
        }
        const newMessage = await Message_1.Message.create({
            acquisitionId: acquisitionId,
            senderId: userId,
            senderName,
            text: text.trim(),
        });
        return res.status(201).json({ success: true, data: newMessage });
    }
    catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ success: false, message: "Failed to send message" });
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.replyToTicket = exports.getAllTickets = exports.getUserTickets = exports.createTicket = void 0;
const Ticket_1 = require("../models/Ticket");
const apiResponse_1 = require("../utils/apiResponse");
// User: Create a ticket
const createTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, initialMessage } = req.body;
        const ticket = await Ticket_1.Ticket.create({
            userId,
            subject,
            messages: [{ senderId: userId, content: initialMessage }],
        });
        return (0, apiResponse_1.sendSuccess)(res, 201, ticket);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to create ticket" });
    }
};
exports.createTicket = createTicket;
// User: Get their own tickets
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await Ticket_1.Ticket.find({ userId }).sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, 200, tickets);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch tickets" });
    }
};
exports.getUserTickets = getUserTickets;
// Admin: Get all tickets
const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket_1.Ticket.find()
            .populate("userId", "name email role")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, 200, tickets);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch all tickets" });
    }
};
exports.getAllTickets = getAllTickets;
// Admin/User: Reply to ticket
const replyToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isInternal } = req.body;
        const senderId = req.user.id;
        const role = req.user.role;
        const ticket = await Ticket_1.Ticket.findById(id);
        if (!ticket)
            return (0, apiResponse_1.sendError)(res, 404, { code: "ERROR", message: "Ticket not found" });
        if (role !== "admin" && ticket.userId.toString() !== senderId) {
            return (0, apiResponse_1.sendError)(res, 403, { code: "ERROR", message: "Not authorized to reply to this ticket" });
        }
        ticket.messages.push({
            senderId,
            content,
            isInternal: role === "admin" ? !!isInternal : false,
            createdAt: new Date(),
        });
        if (role === "admin" && ticket.status === "OPEN") {
            ticket.status = "IN_PROGRESS";
        }
        await ticket.save();
        // Re-fetch to populate if needed
        const updatedTicket = await Ticket_1.Ticket.findById(id)
            .populate("userId", "name email")
            .populate("assignedTo", "name email")
            .populate("messages.senderId", "name email role");
        return (0, apiResponse_1.sendSuccess)(res, 200, updatedTicket);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to reply to ticket" });
    }
};
exports.replyToTicket = replyToTicket;
// Admin: Update Ticket Status
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo } = req.body;
        const updateFields = {};
        if (status)
            updateFields.status = status;
        if (priority)
            updateFields.priority = priority;
        if (assignedTo !== undefined)
            updateFields.assignedTo = assignedTo || null;
        const ticket = await Ticket_1.Ticket.findByIdAndUpdate(id, updateFields, { new: true })
            .populate("userId", "name email")
            .populate("assignedTo", "name email");
        if (!ticket)
            return (0, apiResponse_1.sendError)(res, 404, { code: "ERROR", message: "Ticket not found" });
        return (0, apiResponse_1.sendSuccess)(res, 200, ticket);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to update ticket" });
    }
};
exports.updateTicketStatus = updateTicketStatus;

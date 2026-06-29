"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContent = exports.upsertContent = exports.getAllContent = exports.getContent = void 0;
const Content_1 = require("../models/Content");
const apiResponse_1 = require("../utils/apiResponse");
// Public: Get published content
const getContent = async (req, res) => {
    try {
        const key = req.params.key;
        const content = await Content_1.Content.findOne({ key, published: true });
        if (!content)
            return (0, apiResponse_1.sendError)(res, 404, { code: "ERROR", message: "Content not found" });
        return (0, apiResponse_1.sendSuccess)(res, 200, content);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch content" });
    }
};
exports.getContent = getContent;
// Admin: Get all content blocks
const getAllContent = async (req, res) => {
    try {
        const contents = await Content_1.Content.find().populate("lastUpdatedBy", "name email");
        return (0, apiResponse_1.sendSuccess)(res, 200, contents);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch content blocks" });
    }
};
exports.getAllContent = getAllContent;
// Admin: Create or update content
const upsertContent = async (req, res) => {
    try {
        const key = req.params.key;
        const { title, type, data, published } = req.body;
        const adminId = req.user.id;
        let content = await Content_1.Content.findOne({ key });
        if (content) {
            content.title = title ?? content.title;
            content.type = type ?? content.type;
            content.data = data ?? content.data;
            if (published !== undefined)
                content.published = published;
            content.lastUpdatedBy = adminId;
            await content.save();
        }
        else {
            content = await Content_1.Content.create({
                key,
                title,
                type: type || "HTML",
                data,
                published: published ?? true,
                lastUpdatedBy: adminId
            });
        }
        return (0, apiResponse_1.sendSuccess)(res, 200, content);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to save content" });
    }
};
exports.upsertContent = upsertContent;
// Admin: Delete content
const deleteContent = async (req, res) => {
    try {
        const key = req.params.key;
        const content = await Content_1.Content.findOneAndDelete({ key });
        if (!content)
            return (0, apiResponse_1.sendError)(res, 404, { code: "ERROR", message: "Content not found" });
        return (0, apiResponse_1.sendSuccess)(res, 200, { ok: true });
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to delete content" });
    }
};
exports.deleteContent = deleteContent;

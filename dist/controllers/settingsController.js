"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertSetting = exports.getAllSettings = void 0;
const Settings_1 = require("../models/Settings");
const apiResponse_1 = require("../utils/apiResponse");
// Admin: Get all settings
const getAllSettings = async (req, res) => {
    try {
        const settings = await Settings_1.Settings.find().populate("updatedBy", "name email");
        return (0, apiResponse_1.sendSuccess)(res, 200, settings);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to fetch settings" });
    }
};
exports.getAllSettings = getAllSettings;
// Admin: Update setting
const upsertSetting = async (req, res) => {
    try {
        const key = req.params.key;
        const { value, description } = req.body;
        const adminId = req.user.id;
        let setting = await Settings_1.Settings.findOne({ key });
        if (setting) {
            setting.value = value;
            if (description !== undefined)
                setting.description = description;
            setting.updatedBy = adminId;
            await setting.save();
        }
        else {
            setting = await Settings_1.Settings.create({
                key,
                value,
                description,
                updatedBy: adminId
            });
        }
        return (0, apiResponse_1.sendSuccess)(res, 200, setting);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 500, { code: "ERROR", message: error.message || "Failed to save setting" });
    }
};
exports.upsertSetting = upsertSetting;

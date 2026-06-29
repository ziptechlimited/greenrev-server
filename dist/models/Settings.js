"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const settingsSchema = new mongoose_1.default.Schema({
    key: {
        type: String,
        required: true,
        unique: true, // e.g., "global_fees", "maintenance_mode"
    },
    value: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
    },
    description: {
        type: String,
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
});
exports.Settings = mongoose_1.default.model("Settings", settingsSchema);

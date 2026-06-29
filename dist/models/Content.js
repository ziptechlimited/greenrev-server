"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contentSchema = new mongoose_1.default.Schema({
    key: {
        type: String,
        required: true,
        unique: true, // e.g., "terms_of_service", "home_banner"
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["HTML", "TEXT", "JSON"],
        default: "HTML",
    },
    data: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
    },
    published: {
        type: Boolean,
        default: true,
    },
    lastUpdatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
});
exports.Content = mongoose_1.default.model("Content", contentSchema);

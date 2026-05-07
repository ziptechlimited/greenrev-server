"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Example = void 0;
const mongoose_1 = require("mongoose");
const exampleSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
}, { timestamps: true });
exports.Example = (0, mongoose_1.model)("Example", exampleSchema);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertStrongPassword = assertStrongPassword;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
function assertStrongPassword(password) {
    if (!strongPasswordRegex.test(password)) {
        throw new Error("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol");
    }
}
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, env_1.env.bcryptSaltRounds);
}
async function verifyPassword(password, passwordHash) {
    return bcryptjs_1.default.compare(password, passwordHash);
}

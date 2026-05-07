"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(req, res) {
    res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
}
function errorHandler(err, _req, res, _next) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ message });
}

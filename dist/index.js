"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const db_1 = require("./config/db");
async function main() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not set");
    }
    const port = Number(process.env.PORT ?? 5050);
    await (0, db_1.connectDB)(mongoUri);
    console.log("MongoDB connected");
    const app = (0, app_1.createApp)();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
main().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to start server: ${message}`);
    process.exit(1);
});

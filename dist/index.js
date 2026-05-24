"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
async function main() {
    await (0, db_1.connectDB)(env_1.env.mongoUri);
    console.log("MongoDB connected");
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.port, () => {
        console.log(`Server running on port ${env_1.env.port}`);
    });
}
main().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to start server: ${message}`);
    process.exit(1);
});

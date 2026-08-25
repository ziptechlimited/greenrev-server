import "dotenv/config";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { createServer } from "http";
import { initSocketIO } from "./socket";

async function main(): Promise<void> {
  await connectDB(env.mongoUri);
  console.log("MongoDB connected");

  const app = createApp();
  const server = createServer(app);

  initSocketIO(server);

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Failed to start server: ${message}`);
  process.exit(1);
});

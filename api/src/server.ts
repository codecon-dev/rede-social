import dotenv from "dotenv";
dotenv.config();

import { createServer } from "node:http";
import { app } from "./app";
import { config } from "./config/config";
import { connectDatabase } from "./config/database";
import { initializeChatService } from "./services/chatService";

const startServer = async () => {
  try {
    await connectDatabase();
    console.log("Database connected successfully");
    const server = createServer(app);

    initializeChatService(server);
    server.listen(config.port, () => {
      console.log(
        `Server running on port ${config.port} in ${config.nodeEnv} mode`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

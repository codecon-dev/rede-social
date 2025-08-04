import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { type Socket, Server as SocketIOServer } from "socket.io";
import { config } from "../config/config";
import { pool } from "../config/database";
import type { JWTPayload } from "../types";

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

class ChatService {
  private io: SocketIOServer;
  private userSockets = new Map<number, string>();
  private socketUsers = new Map<string, number>();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
        socket.userId = decoded.userId;
        socket.username = decoded.username;

        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
        this.socketUsers.set(socket.id, socket.userId);

        this.joinUserRooms(socket);
      }

      socket.on("join-room", (room_id: string) => {
        socket.join(`room-${room_id}`);
      });

      socket.on("leave-room", (room_id: string) => {
        socket.leave(`room-${room_id}`);
      });

      socket.on(
        "send-message",
        async (data: {
          room_id: number;
          message: string;
          message_type?: string;
        }) => {
          try {
            await this.handleSendMessage(socket, data);
          } catch (error) {
            console.error("Error handling send message:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        },
      );

      socket.on("typing-start", (room_id: number) => {
        socket.to(`room-${room_id}`).emit("user-typing", {
          user_id: socket.userId,
          username: socket.username,
          room_id,
        });
      });

      socket.on("typing-stop", (room_id: number) => {
        socket.to(`room-${room_id}`).emit("user-stopped-typing", {
          user_id: socket.userId,
          username: socket.username,
          room_id,
        });
      });

      socket.on("disconnect", () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          this.socketUsers.delete(socket.id);
        }
      });
    });
  }

  private async joinUserRooms(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT room_id FROM chat_rooms_members WHERE user_id = $1",
        [socket.userId],
      );

      result.rows.forEach((row) => {
        socket.join(`room-${row.room_id}`);
      });
    } catch (error) {
      console.error("Error joining user rooms:", error);
    } finally {
      client.release();
    }
  }

  private async handleSendMessage(
    socket: AuthenticatedSocket,
    data: {
      room_id: number;
      message: string;
      message_type?: string;
    },
  ) {
    const client = await pool.connect();

    try {
      if (!socket.userId) return;

      const { room_id, message, message_type = "text" } = data;

      await client.query("BEGIN");

      const memberCheck = await client.query(
        "SELECT 1 FROM chat_rooms_members WHERE room_id = $1 AND user_id = $2",
        [room_id, socket.userId],
      );

      if (memberCheck.rows.length === 0) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      const result = await client.query(
        `
      INSERT INTO chat_messages (room_id, user_id, message, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
        [room_id, socket.userId, message, message_type],
      );

      await client.query(
        "UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [room_id],
      );

      const userResult = await client.query(
        "SELECT username, first_name, last_name, avatar_url FROM users WHERE id = $1",
        [socket.userId],
      );

      await client.query("COMMIT");

      const messageWithUser = {
        ...result.rows[0],
        ...userResult.rows[0],
      };

      this.broadcastMessage(room_id, messageWithUser);
    } catch (error) {
      console.error("Error sending message:", error);
      if (client) {
        await client.query("ROLLBACK");
      }
      socket.emit("error", { message: "Failed to send message" });
    } finally {
      client.release();
    }
  }

  public async broadcastMessage(room_id: number, message: any) {
    this.io.to(`room-${room_id}`).emit("new-message", message);
  }

  public async notifyNewRoom(user_ids: number[], room: any) {
    user_ids.forEach((userId) => {
      const socketId = this.userSockets.get(userId);
      if (socketId) {
        this.io.to(socketId).emit("new-room", room);
      }
    });
  }

  public getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  public isUserOnline(userId: number) {
    return this.userSockets.has(userId);
  }
}

let chatService: ChatService;

export const initializeChatService = (server: HTTPServer) => {
  chatService = new ChatService(server);
  return chatService;
};

export const getChatService = () => {
  if (!chatService) {
    throw new Error("Chat service not initialized");
  }
  return chatService;
};

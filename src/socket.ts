import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";

export let io: SocketIOServer;

export function initSocketIO(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3000"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth.token;
      
      // If no auth token (web client), check cookies
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie
          .split(";")
          .map((c) => c.trim())
          .reduce((acc, c) => {
            const [k, v] = c.split("=");
            acc[k] = v;
            return acc;
          }, {} as Record<string, string>);
        token = cookies["accessToken"];
      }

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const secret = process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-in-production";
      const payload = jwt.verify(token, secret) as any;
      socket.data.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    // Join a room specific to this user ID
    if (socket.data.userId) {
      socket.join(socket.data.userId.toString());
      console.log(`Socket connected and joined room: ${socket.data.userId}`);
    }

    socket.on("disconnect", () => {
      // console.log(`Socket disconnected: ${socket.data.userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

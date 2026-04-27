import { Server } from "socket.io";
import Professional from "../models/Professional.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    const { professionalId } = socket.handshake.query;

    if (professionalId) {
      try {
        const professional = await Professional.findById(professionalId).select("skills");
        if (professional && professional.skills.length > 0) {
          professional.skills.forEach((skill) => {
            socket.join(`service_${skill}`);
          });
        }
        socket.join(`professional_${professionalId}`);
      } catch {
        // invalid id — ignore
      }
    }

    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized.");
  return io;
};

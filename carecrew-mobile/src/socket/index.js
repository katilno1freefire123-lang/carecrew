import { io } from "socket.io-client";
import { SOCKET_BASE } from "../constants/api.js";

let socket = null;

export const connectSocket = (professionalId) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_BASE, {
    transports: ["websocket"],
    query: professionalId ? { professionalId } : {},
    reconnection: true,
    reconnectionAttempts: 5,
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export default { connectSocket, getSocket, disconnectSocket };

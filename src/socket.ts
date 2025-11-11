import { io } from "socket.io-client";

// Configuração do socket.io client com o endereço do servidor
const socket = io("http://52.204.130.236:4000", {
  withCredentials: true, // Permite o envio de cookies
  transports: ["websocket"], // Força o uso de WebSocket
});

export { socket };

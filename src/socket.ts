import { io } from "socket.io-client";

// Configuração do socket.io client com o endereço do servidor
const socket = io("http://localhost:4000", {
  withCredentials: true,
  transports: ["websocket"],
});

export { socket };

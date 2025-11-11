import { io } from "socket.io-client";

// Configuração do socket.io client com o endereço do servidor
const socket = io("https://sleeve-thus-certain-mainly.trycloudflare.com", {
  transports: ["websocket"],
});

export { socket };

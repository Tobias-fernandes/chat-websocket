import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Message } from "@/types";

const port = 4000;

// Armazenamento em memória simples para o histórico de mensagens
const messages: Message[] = [
  {
    msg: "Welcome to the chat!",
    name: "Server",
    id: "server-id",
  },
];

const app = express();
const httpServer = createServer(app);

// Configuração do servidor Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://chat-websocket-blush.vercel.app", // Front hospedado na Vercel
      "http://localhost:3000", // Ambiente local
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Eventos do socket
io.on("connection", (socket) => {
  console.log(`🟢 Novo cliente conectado: ${socket.id}`);

  socket.on("getPreviousMessages", () => {
    socket.emit("previousMessages", messages);
  });

  socket.on("message", (data: Message) => {
    console.log(`${data.name}: ${data.msg}`);
    messages.push(data);
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

// Inicializa o servidor HTTP
httpServer.listen(port, () => {
  console.log(`🚀 Servidor WebSocket rodando na porta ${port}`);
  console.log("✅ Execute agora:");
  console.log("   cloudflared tunnel --url http://localhost:4000");
});

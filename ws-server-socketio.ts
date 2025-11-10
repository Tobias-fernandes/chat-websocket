import { createServer } from "node:http"; // Importa o módulo HTTP do Node.js
import next from "next"; // Importa o Next.js
import { Server } from "socket.io"; // Importa o Socket.IO
import { Message } from "@/types";

const dev = process.env.NODE_ENV !== "production"; // Verifica se está em modo de desenvolvimento
const hostname = "34.229.147.171"; // Nome do host
const port = 4000; // Porta do servidor WebSocket

const app = next({ dev, hostname, port }); // Cria uma instância do Next.js
const handler = app.getRequestHandler(); // Obtém o manipulador de requisições do Next.js

// Armazenamento em memória simples para o histórico de mensagens
const messages: Message[] = [
  {
    msg: "Welcome to the chat!",
    name: "Server",
    id: "server-id",
  },
];

// Prepara o aplicativo Next.js e inicia o servidor HTTP com Socket.IO
app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      // Configuração de CORS
      origin: [
        "https://chat-websocket-blush.vercel.app/",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Evento ocorre assim que um cliente se conecta ao servidor Socket.IO
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Evento para enviar o histórico de mensagens ao cliente
    socket.on("getPreviousMessages", () => {
      console.log(`Sending history to ${socket.id}`);
      socket.emit("previousMessages", messages); // envia o histórico armazenado
    });

    // Evento para nova mensagem recebida
    socket.on("message", (data: Message) => {
      console.log(`${data.name}: ${data.msg}`);

      messages.push(data); // salva no histórico
      io.emit("message", data); // envia pra todos os clientes
    });

    // Evento ocorre quando o cliente se desconecta
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Inicia o servidor HTTP
  httpServer.listen(port, () => {
    console.log(`Server ready at http://${hostname}:${port}`);
  });
});

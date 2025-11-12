import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { ESocketEvents, Message } from "@/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost"; // run server on localhost
const port = 4000; // Port to run the WebSocket server

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Storage in memory for message history
const messages: Message[] = [
  {
    msg: "Welcome to the chat!",
    name: "Server",
    id: "server-id",
  },
];

app.prepare().then(() => {
  const httpServer = createServer(handler); // Creates an HTTP server

  // Initializes a new Socket.io server
  const io = new Server(httpServer, {
    // CORS settings to allow connections from the frontend
    cors: {
      origin: ["http://localhost:3000"], // Frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket events

  // Fires when a client connects
  io.on(ESocketEvents.CONNECTION, (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Sends the message history to the client that just connected
    socket.on(ESocketEvents.GET_PREVIOUS_MESSAGES, () => {
      socket.emit(ESocketEvents.PREVIOUS_MESSAGES, messages);
    });

    // Receives a new message from the client
    socket.on(ESocketEvents.MESSAGE, (data: Message) => {
      console.log(`${data.name}: ${data.msg}`);
      messages.push(data); // Stores the message in the history
      io.emit(ESocketEvents.MESSAGE, data); // Emits the message to all connected clients
    });

    // Fires when a client disconnects
    socket.on(ESocketEvents.DISCONNECT, () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Initializes the HTTP server
  httpServer.listen(port, hostname, () => {
    console.log(`WebSocket server running on port ${port}`);
  });
});

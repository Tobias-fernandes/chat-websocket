import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Message } from "@/types";
import { ESocketEvents } from "@/types";

const HOST = "0.0.0.0"; // Allows connections from any IP
const PORT = 4000; // Port to run the WebSocket server

// Storage in memory for message history
const messages: Message[] = [
  {
    msg: "Welcome to the chat!",
    name: "Server",
    id: "server-id",
  },
];

const app = express(); // Create an instance of Express
const httpServer = createServer(app); // Create the HTTP server

// Socket.IO server configuration
const io = new Server(httpServer, {
  // CORS settings to allow connections from the frontend
  cors: {
    origin: [
      "https://chat-websocket-blush.vercel.app", // frontend hosted on Vercel
      "http://localhost:3000", // local testing
    ],
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
httpServer.listen(PORT, HOST, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

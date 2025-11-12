import { io } from "socket.io-client";
// This file is used to connect the user to the server via socket.io

// Socket.io client configuration with the server address
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

export { socket };

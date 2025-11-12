import { io } from "socket.io-client";
// This file is used to connect the user to the server via socket.io

// Socket.io client configuration with the server address
const socket = io("wss://standing-signal-pie-comprehensive.trycloudflare.com", {
  transports: ["websocket"],
});

export { socket };

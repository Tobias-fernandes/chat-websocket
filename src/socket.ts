import { io } from "socket.io-client";

const socket = io("http://3.88.37.132:4001", {
  withCredentials: true,
  transports: ["websocket"],
});

export { socket };

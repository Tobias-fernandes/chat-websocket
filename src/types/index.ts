// Interface to define the structure of a message
interface Message {
  msg: string;
  name: string;
  id: string;
}

// Enum for socket event names
enum ESocketEvents {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  MESSAGE = "message",
  GET_PREVIOUS_MESSAGES = "getPreviousMessages",
  PREVIOUS_MESSAGES = "previousMessages",
  UPGRADE = "upgrade",
}

export type { Message };
export { ESocketEvents };

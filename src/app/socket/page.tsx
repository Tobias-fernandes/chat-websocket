/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { socket } from "../../socket";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useChatScroll } from "@/utils/useChatScroll";
import { getOrCreateUserId } from "@/utils/getUserID";
import { onEnterPress } from "@/utils/submitInputWithEnter";
import { Message } from "@/types";
import { ESocketEvents } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const userId = getOrCreateUserId();

  const [isConnected, setIsConnected] = useState(false); // connection state
  const [transport, setTransport] = useState("N/A"); // current transport
  const [messages, setMessages] = useState<Message[]>([]); // chat messages
  const [inputValue, setInputValue] = useState(""); // input value
  const [username, setUsername] = useState(""); // user name
  const [isLoading, setIsLoading] = useState(true); // loading state
  const [hasRequestedHistory, setHasRequestedHistory] = useState(false); // state to track if history has been requested

  /** Loads the user name */
  const loadUserName = useCallback(() => {
    const storedName = localStorage.getItem("username"); // gets name from localStorage
    if (!storedName) return router.push("/"); // if it doesn't exist, redirect to the home page
    setUsername(storedName); // set the user name in the state
  }, [router]);

  /** Connected to the server */
  const handleConnect = useCallback(() => {
    console.log("Connected to server");
    setIsConnected(true); // update connection state
    setTransport(socket.io.engine.transport.name); // set the current transport

    // Requests message history only once
    if (!hasRequestedHistory) {
      // Small delay to ensure the socket is fully ready before requesting history
      setTimeout(() => {
        socket.emit(ESocketEvents.GET_PREVIOUS_MESSAGES);
      }, 200);
      setHasRequestedHistory(true);
    }

    // Monitors changes in transport (e.g., polling -> websocket)
    socket.io.engine.on(ESocketEvents.UPGRADE, (t) => {
      setTransport(t.name);
    });
  }, [hasRequestedHistory]);

  /** Disconnected from the server */
  const handleDisconnect = () => {
    console.log("Disconnected from server");
    setIsConnected(false);
    setTransport("N/A");
  };

  /** New message received */
  const handleMessage = (data: Message) => {
    console.log("New message received:", data);
    setMessages((prev) => [...prev, data]);
  };

  /** Receives full history */
  const handlePreviousMessages = (data: Message[]) => {
    console.log("Received history:", data);
    setMessages(data);
    setIsLoading(false);
  };

  /** Sends a new message */
  const handleSendMessage = () => {
    if (!inputValue.trim() || !username) return;

    const messageData = { msg: inputValue, id: userId, name: username };
    socket.emit(ESocketEvents.MESSAGE, messageData);

    setInputValue("");
  };

  /** Initializes the socket */
  useEffect(() => {
    console.log("Initializing socket...");

    loadUserName();

    if (socket.connected) handleConnect();

    socket.once(ESocketEvents.CONNECTION, handleConnect);
    socket.on(ESocketEvents.DISCONNECT, handleDisconnect);
    socket.on(ESocketEvents.MESSAGE, handleMessage);
    socket.on(ESocketEvents.PREVIOUS_MESSAGES, handlePreviousMessages);

    return () => {
      socket.off(ESocketEvents.CONNECTION, handleConnect);
      socket.off(ESocketEvents.DISCONNECT, handleDisconnect);
      socket.off(ESocketEvents.MESSAGE, handleMessage);
      socket.off(ESocketEvents.PREVIOUS_MESSAGES, handlePreviousMessages);
    };
  }, [loadUserName, handleConnect]);

  // Hook to automatically scroll the chat
  const chatContainerRef = useChatScroll<HTMLUListElement>([messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <Card className="relative mx-auto max-w-3xl h-screen">
      <CardHeader>
        <CardTitle>Web Chat App</CardTitle>
        <CardDescription>
          <p>Name: {username}</p>
          <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
          <p>Transport: {transport}</p>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul
          id="chat-container"
          ref={chatContainerRef}
          className="overflow-auto bg-accent-foreground h-screen rounded-2xl flex flex-col gap-2 max-h-[68vh] px-4 py-6"
        >
          {!messages.length && (
            <li className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </li>
          )}

          {messages.map((data, index) => {
            const { msg, name, id } = data;
            const isOwnMessage = id === userId;
            return (
              <li
                key={index}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-white ${
                    isOwnMessage
                      ? "bg-green-500 rounded-br-none"
                      : "bg-gray-600 rounded-bl-none"
                  }`}
                >
                  <span className="font-bold text-xs mr-2">
                    {isOwnMessage ? "You" : name}:
                  </span>
                  {msg}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>

      <CardFooter className="absolute bottom-0 left-0 right-0 flex mb-8">
        <Input
          placeholder="Type your message..."
          className="mr-2"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onEnterPress(handleSendMessage)}
        />
        <Button
          className="w-24"
          onClick={handleSendMessage}
          disabled={!isConnected || !inputValue.trim()}
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}

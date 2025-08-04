/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { apiClient } from "../services/api";
import type { ChatMessage, ChatRoom, ChatRoomMember } from "../types";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  typingUsers: ChatRoomMember[];
  setCurrentRoom: (room: ChatRoom | null) => void;
  setCurrentRoomById: (room_id: number) => void;
  sendMessage: (message: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  joinRoom: (room_id: number) => void;
  leaveRoom: (room_id: number) => void;
  refreshRooms: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<ChatRoomMember[]>([]);

  const fetchRooms = useCallback(async () => {
    if (!user || !token) return;

    try {
      const roomsData = await apiClient.getUserChatRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, [user, token]);

  const fetchMessages = useCallback(
    async (room_id: number, page = 1) => {
      if (!user || !token) return;

      try {
        const messagesData = await apiClient.getChatRoomMessages(room_id, page);
        if (page === 1) {
          setMessages(messagesData);
        } else {
          setMessages((prev) => [...messagesData, ...prev]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    [user, token],
  );

  const joinRoom = useCallback(
    (room_id: number) => {
      if (!socket) return;
      socket.emit("join-room", room_id);
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (room_id: number) => {
      if (!socket) return;
      socket.emit("leave-room", room_id);
    },
    [socket],
  );

  useEffect(() => {
    if (!user || !token) {
      setSocket(null);
      return;
    }

    const newSocket = io("http://localhost:8080", {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("new-message", (message: ChatMessage) => {
      if (message.room_id === currentRoom?.id) {
        setMessages((prev) => [...prev, message]);
      }

      setRooms((prev) =>
        prev.map((room) =>
          room.id === message.room_id
            ? {
                ...room,
                last_message: message,
                updated_at: message.created_at,
              }
            : room,
        ),
      );
    });

    newSocket.on("new-room", (room: ChatRoom) => {
      setRooms((prev) => [room, ...prev]);
    });

    newSocket.on(
      "user-typing",
      ({ user_id, username, room_id }: ChatRoomMember) => {
        if (room_id === currentRoom?.id && user_id !== user.id) {
          setTypingUsers((prev) => {
            const existing = prev.find((u) => u.user_id === user_id);
            if (!existing) {
              return [...prev, { user_id, username, room_id }];
            }
            return prev;
          });
        }
      },
    );

    newSocket.on("user-stopped-typing", ({ user_id }) => {
      setTypingUsers((prev) => prev.filter((u) => u.user_id !== user_id));
    });

    newSocket.on("error", (error: { message: string }) => {
      console.error("Socket error:", error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, currentRoom?.id]);

  useEffect(() => {
    setTypingUsers([]);
  }, []);

  const sendMessage = (message: string) => {
    if (!socket || !currentRoom || !message.trim()) return;
    socket.emit("send-message", {
      room_id: currentRoom.id,
      message: message.trim(),
      message_type: "text",
    });
  };

  const startTyping = () => {
    if (!socket || !currentRoom) return;
    socket.emit("typing-start", currentRoom.id);
  };

  const stopTyping = () => {
    if (!socket || !currentRoom) return;
    socket.emit("typing-stop", currentRoom.id);
  };

  const refreshRooms = () => {
    fetchRooms();
  };

  const setCurrentRoomById = useCallback(
    (room_id: number) => {
      const room = rooms.find((r) => r.id === room_id);
      if (room) {
        setCurrentRoom(room);
      }
    },
    [rooms],
  );

  useEffect(() => {
    if (user && token) {
      fetchRooms();
    }
  }, [user, token, fetchRooms]);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom.id);
      joinRoom(currentRoom.id);
    }
  }, [currentRoom, fetchMessages, joinRoom]);

  const value: ChatContextType = {
    socket,
    isConnected,
    rooms,
    currentRoom,
    messages,
    typingUsers,
    setCurrentRoom,
    setCurrentRoomById,
    sendMessage,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
    refreshRooms,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

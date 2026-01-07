"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | string;
  isRead: boolean;
}

interface UsePrivateMessageSocketOptions {
  token: string;
  userId: string;
  advisorId: string; // Pour client: ID du conseiller, pour advisor: ID du client
  role?: "CLIENT" | "ADVISOR"; // Rôle optionnel pour déterminer comment charger
  onMessage?: (message: PrivateMessage) => void;
  onTyping?: (isTyping: boolean, userId: string) => void;
}

export function usePrivateMessageSocket({
  token,
  userId,
  advisorId,
  role,
  onMessage,
  onTyping,
}: UsePrivateMessageSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false); // Statut de l'autre personne
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const advisorIdRef = useRef(advisorId);
  const roleRef = useRef(role);
  
  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onTypingRef.current = onTyping;
    advisorIdRef.current = advisorId;
    roleRef.current = role;
  }, [onMessage, onTyping, advisorId, role]);

  // Initialiser la connexion WebSocket
  useEffect(() => {
    if (!token || !userId || !advisorId || !role) {
      return;
    }

    const newSocket = io(BASE_URL, {
      auth: { token },
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    const handleUserOnline = (data: { userId: string; role?: string }) => {
      const currentRole = roleRef.current;
      const currentAdvisorId = advisorIdRef.current;
      if (currentRole === "CLIENT" && data.userId && currentAdvisorId && data.userId === currentAdvisorId) {
        setIsOtherUserOnline(true);
      }
    };

    const handleUserOffline = (data: { userId: string; role?: string }) => {
      const currentRole = roleRef.current;
      const currentAdvisorId = advisorIdRef.current;
      if (currentRole === "CLIENT" && data.userId && currentAdvisorId && data.userId === currentAdvisorId) {
        setIsOtherUserOnline(false);
      }
    };

    newSocket.on("user_online", handleUserOnline);
    newSocket.on("user_offline", handleUserOffline);

    newSocket.on("connect", () => {
      setIsConnected(true);
      
      setTimeout(() => {
        if (advisorId && role) {
          if (role === "ADVISOR") {
            newSocket.emit("load_conversation", { clientId: advisorId });
          } else if (role === "CLIENT") {
            newSocket.emit("load_conversation", { advisorId });
          }
        }
      }, 200);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("conversation_loaded", (data: { messages: PrivateMessage[]; isOtherUserOnline?: boolean }) => {
      setMessages(data.messages);
      const onlineStatus = typeof data.isOtherUserOnline === "boolean" ? data.isOtherUserOnline : false;
      setIsOtherUserOnline(onlineStatus);
    });

    newSocket.on("new_message", async (data: { message: PrivateMessage }) => {
      const newMessage = {
        ...data.message,
        createdAt: new Date(data.message.createdAt),
      };
      setMessages((prev) => [...prev, newMessage]);
      
      if (onMessageRef.current) {
        onMessageRef.current(newMessage);
      }


      // Afficher une notification si l'utilisateur n'est pas sur la page
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Nouveau message", {
          body: newMessage.content.substring(0, 100),
          icon: "/icon-192x192.png",
          tag: `message-${newMessage.id}`,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });

    newSocket.on("message_sent", (data: { message: PrivateMessage }) => {
      const newMessage = {
        ...data.message,
        createdAt: new Date(data.message.createdAt),
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    newSocket.on("typing", (data: { userId: string; isTyping: boolean }) => {
      const currentRole = roleRef.current;
      const currentAdvisorId = advisorIdRef.current;
      
      if (currentRole === "CLIENT") {
        // Pour le client, vérifier que l'événement vient du conseiller (advisorId)
        // data.userId = l'ID de celui qui tape (le conseiller)
        // currentAdvisorId = l'ID du conseiller assigné au client
        if (data.userId && currentAdvisorId && data.userId === currentAdvisorId && data.userId !== userId) {
          setIsTyping(data.isTyping);
          if (onTypingRef.current) {
            onTypingRef.current(data.isTyping, data.userId);
          }
        }
      } else if (currentRole === "ADVISOR") {
        // Pour le conseiller, vérifier que l'événement vient du client (advisorId pour l'advisor = clientId)
        // data.userId = l'ID de celui qui tape (le client)
        // currentAdvisorId = l'ID du client pour l'advisor
        if (data.userId && currentAdvisorId && data.userId === currentAdvisorId && data.userId !== userId) {
          setIsTyping(data.isTyping);
          if (onTypingRef.current) {
            onTypingRef.current(data.isTyping, data.userId);
          }
        }
      }
    });


    newSocket.on("notification", async (data: { title: string; message: string }) => {
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(data.title, {
          body: data.message,
          icon: "/icon-192x192.png",
          tag: `notification-${Date.now()}`,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });

    newSocket.on("conversation_transferred", (data: { newAdvisorId: string }) => {
      if (onMessageRef.current) {
        const event = new CustomEvent("conversation_transferred", { detail: data });
        window.dispatchEvent(event);
      }
    });

    newSocket.on("conversation_assigned", (data: { clientId: string }) => {
      const event = new CustomEvent("conversation_assigned", { detail: data });
      window.dispatchEvent(event);
    });

    newSocket.on("conversation_unassigned", (data: { clientId: string }) => {
      const event = new CustomEvent("conversation_unassigned", { detail: data });
      window.dispatchEvent(event);
    });

    newSocket.on("error", (error: any) => {
      console.error("Erreur WebSocket:", error);
      // L'erreur peut être un objet vide, vérifier aussi error.message
      if (error?.message) {
        console.error("Message d'erreur:", error.message);
      }
      if (error?.type) {
        console.error("Type d'erreur:", error.type);
      }
      // Si l'erreur est liée à la connexion, mettre à jour le statut
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error: any) => {
      console.error("Erreur de connexion WebSocket:", error);
      if (error?.message) {
        console.error("Message d'erreur de connexion:", error.message);
      }
      setIsConnected(false);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [token, userId, advisorId, role]);

  const stopTyping = useCallback(() => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    currentSocket.emit("typing", {
      receiverId: advisorId,
      isTyping: false,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [advisorId]);

  const sendMessage = useCallback(
    (content: string) => {
      const currentSocket = socketRef.current;
      if (!currentSocket || !content.trim()) return;

      currentSocket.emit("send_message", {
        receiverId: advisorId,
        content: content.trim(),
      });

      stopTyping();
    },
    [advisorId, stopTyping]
  );

  const startTyping = useCallback(() => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !advisorId) {
      return;
    }

    currentSocket.emit("typing", {
      receiverId: advisorId,
      isTyping: true,
    });

    // Arrêter après 3 secondes d'inactivité
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [advisorId, stopTyping, role, userId]);

  return {
    socket,
    messages,
    isConnected,
    isOtherUserOnline,
    isTyping,
    sendMessage,
    startTyping,
    stopTyping,
  };
}


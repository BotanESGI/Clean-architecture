"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface GroupMessage {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  content: string;
  createdAt: Date | string;
}

interface UseGroupMessageSocketOptions {
  token: string;
  userId: string;
  role: "ADVISOR" | "DIRECTOR";
  onMessage?: (message: GroupMessage) => void;
}

export function useGroupMessageSocket({
  token,
  userId,
  role,
  onMessage,
}: UseGroupMessageSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Initialiser la connexion WebSocket
  useEffect(() => {
    if (!token || !userId || (role !== "ADVISOR" && role !== "DIRECTOR")) {
      return;
    }

    const newSocket = io(BASE_URL, {
      auth: { token },
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connecté pour discussion de groupe, socket ID:", newSocket.id);
      setIsConnected(true);
      
      // Rejoindre la discussion de groupe après un court délai pour s'assurer que l'authentification est complète
      setTimeout(() => {
        console.log("Tentative de rejoindre la discussion de groupe...");
        newSocket.emit("join_group_chat", (response: any) => {
          if (response && response.error) {
            console.error("Erreur lors de la jointure:", response.error);
          } else {
            console.log("Rejoint la discussion de groupe avec succès");
          }
        });
      }, 500);
    });


    newSocket.on("connect_error", (error) => {
      console.error("Erreur de connexion WebSocket:", error);
      setIsConnected(false);
    });

    newSocket.on("group_messages_loaded", (data: { messages: GroupMessage[] }) => {
      console.log("Messages de groupe chargés:", data.messages.length);
      setIsJoined(true);
      const formattedMessages = data.messages.map(msg => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
    });

    newSocket.on("new_group_message", (data: { message: GroupMessage }) => {
      console.log("Nouveau message de groupe reçu:", data.message);
      const newMessage = {
        ...data.message,
        createdAt: new Date(data.message.createdAt),
      };
      setMessages((prev) => {
        // Éviter les doublons
        if (prev.some((m) => m.id === newMessage.id)) {
          console.log("Message dupliqué ignoré:", newMessage.id);
          return prev;
        }
        return [...prev, newMessage];
      });
      
      if (onMessageRef.current) {
        onMessageRef.current(newMessage);
      }
    });

    newSocket.on("user_joined_group", (data: { userId: string; role: string; userName: string }) => {
      // Optionnel: afficher une notification quand quelqu'un rejoint
      console.log(`${data.userName} a rejoint la discussion de groupe`);
    });

    newSocket.on("user_left_group", (data: { userId: string }) => {
      // Optionnel: afficher une notification quand quelqu'un quitte
      console.log(`Un utilisateur a quitté la discussion de groupe`);
    });

    newSocket.on("error", (data: { message: string }) => {
      console.error("Erreur WebSocket:", data.message);
      setIsConnected(false);
      setIsJoined(false);
    });
    
    // Écouter les erreurs de connexion
    newSocket.on("disconnect", () => {
      console.log("WebSocket déconnecté");
      setIsConnected(false);
      setIsJoined(false);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
      setSocket(null);
      socketRef.current = null;
    };
  }, [token, userId, role]);

  const sendMessage = (content: string) => {
    if (!socketRef.current) {
      console.error("Impossible d'envoyer le message: socket non initialisé");
      throw new Error("Socket non initialisé");
    }
    
    if (!socketRef.current.connected) {
      console.error("Impossible d'envoyer le message: socket non connecté");
      throw new Error("Socket non connecté");
    }
    
    if (!isJoined) {
      console.error("Impossible d'envoyer le message: pas encore rejoint la discussion de groupe");
      throw new Error("Vous devez d'abord rejoindre la discussion de groupe");
    }
    
    console.log("Envoi d'un message de groupe:", content, "socket ID:", socketRef.current.id);
    socketRef.current.emit("send_group_message", { content }, (response: any) => {
      if (response && response.error) {
        console.error("Erreur lors de l'envoi:", response.error);
      } else {
        console.log("Message envoyé avec succès");
      }
    });
  };

  return {
    socket,
    messages,
    isConnected,
    isJoined,
    sendMessage,
  };
}

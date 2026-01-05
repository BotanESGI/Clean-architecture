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
  
  // Utiliser des refs pour stocker les callbacks et éviter les re-renders
  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);

  // Mettre à jour les refs quand les callbacks changent
  useEffect(() => {
    onMessageRef.current = onMessage;
    onTypingRef.current = onTyping;
  }, [onMessage, onTyping]);

  // Initialiser la connexion WebSocket
  useEffect(() => {
    if (!token || !userId || !advisorId) return;

    const newSocket = io(BASE_URL, {
      auth: { token },
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    // ÉCOUTER LES ÉVÉNEMENTS DE PRÉSENCE AVANT LA CONNEXION
    // pour ne pas manquer les événements qui arrivent juste après la connexion
    
    // Écouter les événements de présence (en ligne/hors ligne)
    newSocket.on("user_online", (data: { userId: string; role?: string }) => {
      console.log("🟢 User online event:", data.userId, "Looking for:", advisorId);
      // Si l'utilisateur qui vient de se connecter est l'autre participant (conseiller ou client)
      if (data.userId === advisorId) {
        console.log("✅ Autre utilisateur en ligne détecté - Mise à jour du statut");
        setIsOtherUserOnline(true);
      }
    });

    newSocket.on("user_offline", (data: { userId: string; role?: string }) => {
      console.log("🔴 User offline event:", data.userId, "Looking for:", advisorId);
      // Si l'utilisateur qui vient de se déconnecter est l'autre participant
      if (data.userId === advisorId) {
        console.log("❌ Autre utilisateur hors ligne détecté - Mise à jour du statut");
        setIsOtherUserOnline(false);
      }
    });

    newSocket.on("connect", () => {
      console.log("🔌 WebSocket connecté");
      setIsConnected(true);
      
      // Charger l'historique de la conversation après un court délai
      // pour s'assurer que le serveur a bien enregistré l'utilisateur
      setTimeout(() => {
        if (advisorId) {
          if (role === "ADVISOR") {
            // Si on est advisor, on charge avec clientId (qui est dans advisorId)
            newSocket.emit("load_conversation", { clientId: advisorId });
          } else {
            // Si on est client, on charge avec advisorId
            newSocket.emit("load_conversation", { advisorId });
          }
        }
      }, 200); // Augmenter légèrement le délai pour laisser le temps au serveur
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 WebSocket déconnecté");
      setIsConnected(false);
    });

    newSocket.on("conversation_loaded", (data: { messages: PrivateMessage[]; isOtherUserOnline?: boolean }) => {
      console.log("📨 Conversation chargée, données complètes:", data);
      console.log("📨 Statut autre utilisateur:", data.isOtherUserOnline, typeof data.isOtherUserOnline);
      setMessages(data.messages);
      // Mettre à jour le statut de l'autre utilisateur
      // Utiliser false par défaut si non défini
      const onlineStatus = typeof data.isOtherUserOnline === "boolean" ? data.isOtherUserOnline : false;
      console.log("📨 Définition du statut à:", onlineStatus);
      setIsOtherUserOnline(onlineStatus);
    });

    newSocket.on("new_message", async (data: { message: PrivateMessage }) => {
      const newMessage = {
        ...data.message,
        createdAt: new Date(data.message.createdAt),
      };
      setMessages((prev) => [...prev, newMessage]);
      
      // Utiliser la ref pour le callback
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
        // Éviter les doublons
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    newSocket.on("typing", (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== userId) {
        setIsTyping(data.isTyping);
        // Utiliser la ref pour le callback
        if (onTypingRef.current) {
          onTypingRef.current(data.isTyping, data.userId);
        }
      }
    });

    // Écouter les événements de présence (en ligne/hors ligne)
    // IMPORTANT: Ces événements doivent être écoutés AVANT la connexion pour ne pas manquer les événements
    newSocket.on("user_online", (data: { userId: string; role?: string }) => {
      console.log("🟢 User online event:", data.userId, "Looking for:", advisorId);
      // Si l'utilisateur qui vient de se connecter est l'autre participant (conseiller ou client)
      if (data.userId === advisorId) {
        console.log("✅ Autre utilisateur en ligne détecté - Mise à jour du statut");
        setIsOtherUserOnline(true);
      }
    });

    newSocket.on("user_offline", (data: { userId: string; role?: string }) => {
      console.log("🔴 User offline event:", data.userId, "Looking for:", advisorId);
      // Si l'utilisateur qui vient de se déconnecter est l'autre participant
      if (data.userId === advisorId) {
        console.log("❌ Autre utilisateur hors ligne détecté - Mise à jour du statut");
        setIsOtherUserOnline(false);
      }
    });

    // Écouter les notifications push
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

    newSocket.on("error", (error: { message: string }) => {
      console.error("Erreur WebSocket:", error);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [token, userId, advisorId, role]);

  // Fonction pour arrêter le statut "en train d'écrire"
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

  // Fonction pour envoyer un message
  const sendMessage = useCallback(
    (content: string) => {
      const currentSocket = socketRef.current;
      if (!currentSocket || !content.trim()) return;

      currentSocket.emit("send_message", {
        receiverId: advisorId,
        content: content.trim(),
      });

      // Arrêter le statut "en train d'écrire"
      stopTyping();
    },
    [advisorId, stopTyping]
  );

  // Fonction pour indiquer qu'on est en train d'écrire
  const startTyping = useCallback(() => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

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
  }, [advisorId, stopTyping]);

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


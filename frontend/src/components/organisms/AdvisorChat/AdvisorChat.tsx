"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivateMessageSocket } from "../../../hooks/usePrivateMessageSocket";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";

interface AdvisorChatProps {
  advisorId: string;
  clientId: string;
  clientName: string;
}

export function AdvisorChat({ advisorId, clientId, clientName }: AdvisorChatProps) {
  const { token } = useAuth();
  const { show } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Utiliser le hook WebSocket avec clientId comme autre participant
  const { messages, isConnected, isOtherUserOnline, isTyping, sendMessage, startTyping, stopTyping } =
    usePrivateMessageSocket({
      token: token || "",
      userId: advisorId,
      advisorId: clientId, // Pour l'advisor, l'autre participant est le client
      role: "ADVISOR", // Indiquer qu'on est un advisor
      onTyping: (isTyping, userId) => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (isTyping) {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      },
    });

  // Scroller vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gérer le changement de texte pour le statut "en train d'écrire"
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim().length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    sendMessage(message);
    setMessage("");
    stopTyping();
  };

  return (
    <div className="glass border border-white/10 rounded-2xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{clientName}</h3>
            <p className="text-sm text-muted">Client</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isOtherUserOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted">
              {isOtherUserOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted py-8">
            <p>Aucun message</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === advisorId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? "bg-primary text-black"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {/* Indicateur "en train d'écrire" */}
        {(isTyping || typingUsers.size > 0) && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Est en train d'écrire</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            onBlur={stopTyping}
            placeholder="Tapez votre message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}


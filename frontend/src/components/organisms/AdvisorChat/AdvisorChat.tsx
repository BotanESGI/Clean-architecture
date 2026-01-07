"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivateMessageSocket } from "../../../hooks/usePrivateMessageSocket";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import api from "../../../lib/api";
import { useRouter } from "next/navigation";

interface AdvisorChatProps {
  advisorId: string;
  clientId: string;
  clientName: string;
  isAssignedToMe?: boolean;
  onTransferComplete?: () => void;
}

interface Advisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function AdvisorChat({ advisorId, clientId, clientName, isAssignedToMe = true, onTransferComplete }: AdvisorChatProps) {
  const { token } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");
  const [transferring, setTransferring] = useState(false);

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

  // Charger la liste des conseillers pour le transfert
  useEffect(() => {
    if (showTransferModal && token) {
      loadAdvisors();
    }
  }, [showTransferModal, token]);

  // Scroller vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadAdvisors = () => {
    if (!token) return;
    api.advisor.listAdvisors(token)
      .then((data) => {
        const otherAdvisors = data.advisors.filter(a => a.id !== advisorId);
        setAdvisors(otherAdvisors);
        setSelectedAdvisorId(otherAdvisors.length > 0 ? otherAdvisors[0].id : "");
      })
      .catch((err: any) => {
        show(err.message || "Erreur lors du chargement des conseillers", "error");
      });
  };

  const handleTransfer = () => {
    if (!selectedAdvisorId || !token) return;
    setTransferring(true);
    api.advisor.transferConversation(clientId, selectedAdvisorId, token)
      .then(() => {
        show("Conversation transférée avec succès", "success");
        setShowTransferModal(false);
        if (onTransferComplete) {
          onTransferComplete();
        } else {
          router.refresh();
        }
      })
      .catch((err: any) => {
        show(err.message || "Erreur lors du transfert", "error");
      })
      .finally(() => {
        setTransferring(false);
      });
  };

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
          <div className="flex items-center gap-3">
            {isAssignedToMe && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 transition"
                title="Transférer la conversation à un autre conseiller"
              >
                Transférer
              </button>
            )}
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

      {/* Modal de transfert */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Transférer la conversation</h3>
            <p className="text-sm text-muted mb-4">
              Sélectionnez un conseiller à qui transférer la conversation avec {clientName}
            </p>
            
            {advisors.length === 0 ? (
              <p className="text-sm text-muted mb-4">Aucun autre conseiller disponible</p>
            ) : (
              <>
                <select
                  value={selectedAdvisorId}
                  onChange={(e) => setSelectedAdvisorId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.firstName} {advisor.lastName} ({advisor.email})
                    </option>
                  ))}
                </select>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="btn-secondary px-4 py-2"
                    disabled={transferring}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={transferring || !selectedAdvisorId}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {transferring ? "Transfert en cours..." : "Transférer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


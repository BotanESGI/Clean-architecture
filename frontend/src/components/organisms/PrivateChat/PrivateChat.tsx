"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivateMessageSocket } from "../../../hooks/usePrivateMessageSocket";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import api from "../../../lib/api";

interface Advisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface PrivateChatProps {
  clientId: string;
}

export function PrivateChat({ clientId }: PrivateChatProps) {
  const { token } = useAuth();
  const { show } = useToast();
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [message, setMessage] = useState("");
  const [isLoadingAdvisor, setIsLoadingAdvisor] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const [advisorId, setAdvisorId] = useState<string>("");
  const advisorIdRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;
    
    const loadAdvisor = () => {
      api.getAssignedAdvisor(clientId)
        .then((data) => {
          if (cancelled) return;
          if (data.id !== advisorIdRef.current) {
            setAdvisor(data);
            setAdvisorId(data.id);
            advisorIdRef.current = data.id;
          }
          setIsLoadingAdvisor(false);
        })
        .catch(() => {
          if (cancelled) return;
          api.getAvailableAdvisor()
            .then((data) => {
              if (cancelled) return;
              if (data.id !== advisorIdRef.current) {
                setAdvisor(data);
                setAdvisorId(data.id);
                advisorIdRef.current = data.id;
              }
              setIsLoadingAdvisor(false);
            })
            .catch(() => {
              if (!cancelled) {
                show("Erreur lors du chargement du conseiller", "error");
                setIsLoadingAdvisor(false);
              }
            });
        });
    };

    loadAdvisor();

    return () => {
      cancelled = true;
    };
  }, [clientId, show]);

  useEffect(() => {
    advisorIdRef.current = advisorId;
  }, [advisorId]);

  useEffect(() => {
    const handleConversationTransferred = () => {
      api.getAssignedAdvisor(clientId)
        .then((data) => {
          if (data.id !== advisorIdRef.current) {
            setAdvisor(data);
            setAdvisorId(data.id);
            advisorIdRef.current = data.id;
          }
        })
        .catch(() => {
          api.getAvailableAdvisor()
            .then((data) => {
              if (data.id !== advisorIdRef.current) {
                setAdvisor(data);
                setAdvisorId(data.id);
                advisorIdRef.current = data.id;
              }
            })
            .catch(() => {});
        });
    };

    window.addEventListener("conversation_transferred", handleConversationTransferred);
    return () => {
      window.removeEventListener("conversation_transferred", handleConversationTransferred);
    };
  }, [clientId, show]);

  useEffect(() => {
    if (!advisorId) return;
    
    const interval = setInterval(() => {
      api.getAssignedAdvisor(clientId)
        .then((data) => {
          if (data.id !== advisorIdRef.current) {
            setAdvisor(data);
            setAdvisorId(data.id);
            advisorIdRef.current = data.id;
          }
        })
        .catch(() => {
          api.getAvailableAdvisor()
            .then((data) => {
              if (data.id !== advisorIdRef.current) {
                setAdvisor(data);
                setAdvisorId(data.id);
                advisorIdRef.current = data.id;
              }
            })
            .catch(() => {});
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [clientId, advisorId, show]);

  const { messages, isConnected, isOtherUserOnline, isTyping, sendMessage, startTyping, stopTyping } =
    usePrivateMessageSocket({
      token: token || "",
      userId: clientId,
      advisorId: advisorId,
      role: advisorId ? "CLIENT" : undefined,
      onMessage: (message) => {
        if (message.senderId !== advisorId && message.senderId !== clientId) {
          api.getAssignedAdvisor(clientId)
            .then((data) => {
              if (data.id !== advisorIdRef.current) {
                setAdvisor(data);
                setAdvisorId(data.id);
                advisorIdRef.current = data.id;
              }
            })
            .catch(() => {
              api.getAvailableAdvisor()
                .then((data) => {
                  if (data.id !== advisorIdRef.current) {
                    setAdvisor(data);
                    setAdvisorId(data.id);
                    advisorIdRef.current = data.id;
                  }
                })
                .catch(() => {});
            });
        }
      },
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

  // Demander la permission pour les notifications au chargement
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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

  if (isLoadingAdvisor || !advisorId) {
    return (
      <div className="glass border border-white/10 rounded-2xl p-6">
        <p className="text-muted text-center">Chargement du conseiller...</p>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="glass border border-white/10 rounded-2xl p-6">
        <p className="text-red-500 text-center">Aucun conseiller disponible</p>
      </div>
    );
  }

  return (
    <div className="glass border border-white/10 rounded-2xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              {advisor.firstName} {advisor.lastName}
            </h3>
            <p className="text-sm text-muted">Conseiller bancaire</p>
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
            <p className="text-sm mt-2">Envoyez un message pour commencer la conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === clientId;
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


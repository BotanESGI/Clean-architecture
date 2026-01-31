"use client";

import { useState, useEffect, useRef } from "react";
import { useGroupMessageSocket, GroupMessage } from "../../../hooks/useGroupMessageSocket";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { decodeClientId } from "../../../lib/utils";

export function GroupChat() {
  const { token } = useAuth();
  const { show } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<"ADVISOR" | "DIRECTOR" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Récupérer le rôle depuis localStorage et l'ID depuis le token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role") as "ADVISOR" | "DIRECTOR" | null;
      const storedToken = localStorage.getItem("token");
      setRole(storedRole);
      setUserId(decodeClientId(storedToken));
    }
  }, [token]);

  const { messages, isConnected, isJoined, sendMessage } = useGroupMessageSocket({
    token: token || "",
    userId: userId || "",
    role: role || "ADVISOR",
  });

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !isJoined) {
      if (!isConnected) {
        show("Connexion en cours, veuillez patienter...", "warning");
      } else if (!isJoined) {
        show("Rejoignez la discussion de groupe...", "warning");
      }
      return;
    }

    try {
      sendMessage(message.trim());
      setMessage("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'envoi du message";
      show(errorMessage, "error");
      console.error("Erreur sendMessage:", error);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const isDirector = (msg: GroupMessage) => msg.senderRole === "DIRECTOR";
  const isOwnMessage = (msg: GroupMessage) => msg.senderId === userId;
  const currentUserIsDirector = role === "DIRECTOR";

  if (!role || (role !== "ADVISOR" && role !== "DIRECTOR")) {
    return (
      <div className="flex items-center justify-center h-full card">
        <p className="text-muted">Accès refusé. Seuls les conseillers et directeurs peuvent accéder à la discussion de groupe.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full card p-0 overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Discussion de groupe</h2>
            <p className="text-sm text-muted mt-1">
              {isConnected && isJoined ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <span className="text-primary">Connecté et prêt</span>
                </span>
              ) : isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span className="text-yellow-400">Connexion en cours...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span className="text-red-400">Déconnecté</span>
                </span>
              )}
            </p>
          </div>
          {currentUserIsDirector && (
            <span className="pill bg-purple-500/20 text-purple-400 border-purple-500/40 font-bold">
              👑 DIRECTEUR
            </span>
          )}
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.length === 0 ? (
          <div className="text-center text-muted py-8">
            <p>Aucun message pour le moment.</p>
            <p className="text-sm mt-2">Soyez le premier à écrire !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isDir = isDirector(msg);
            const isOwn = isOwnMessage(msg);
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl p-3 ${
                    isDir
                      ? isOwn
                        ? "bg-gradient-to-r from-purple-600/90 to-purple-700/90 text-white shadow-lg border-2 border-purple-400/50 glow-ring"
                        : "bg-gradient-to-r from-purple-500/80 to-purple-600/80 text-white shadow-md border-2 border-purple-300/40"
                      : isOwn
                      ? "bg-primary/20 text-text border border-primary/40"
                      : "bg-card text-text border border-white/10"
                  }`}
                >
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-semibold text-sm ${
                          isDir ? "text-purple-100" : "text-muted"
                        }`}
                      >
                        {msg.senderName}
                      </span>
                      {isDir && (
                        <span className="pill bg-purple-400/30 text-purple-200 border-purple-400/50 font-bold text-xs">
                          👑 DIRECTEUR
                        </span>
                      )}
                    </div>
                  )}
                  {isOwn && isDir && (
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="pill bg-purple-400/30 text-purple-200 border-purple-400/50 font-bold text-xs">
                        👑 DIRECTEUR
                      </span>
                      <span className="font-semibold text-sm text-purple-100">
                        Vous
                      </span>
                    </div>
                  )}
                  {isOwn && !isDir && (
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="font-semibold text-sm text-primary">
                        Vous
                      </span>
                    </div>
                  )}
                  <p
                    className={`${
                      isDir ? "text-white" : "text-text"
                    } break-words`}
                  >
                    {msg.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isDir ? "text-purple-200/80" : "text-muted"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSend} className="border-t border-white/10 p-4 bg-card/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected && isJoined ? "Tapez votre message..." : isConnected ? "Rejoignez la discussion..." : "Connexion en cours..."}
            disabled={!isConnected || !isJoined}
            className="input-dark flex-1"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!isConnected || !isJoined || !message.trim()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          {message.length}/1000 caractères
        </p>
      </form>
    </div>
  );
}

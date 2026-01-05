"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useTranslation } from "../../../hooks/useTranslation";

export default function ContactPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      show(t("contact.subjectRequired"), "error");
      return;
    }
    
    if (!message.trim()) {
      show(t("contact.messageRequired"), "error");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implémenter l'appel API pour créer le message
      // Pour l'instant, on simule juste un envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      show(t("contact.sendSuccess"), "success");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("contact.sendError");
      show(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // TODO: Récupérer les conversations depuis l'API
  const conversations: Array<{ id: string; subject: string; lastMessage: string; date: string; unread?: boolean }> = [];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t("contact.contactAdvisor")}</h1>
          <p className="text-muted text-sm mt-1">{t("contact.contactDescription")}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-secondary"
        >
          {t("contact.backToDashboard")}
        </button>
      </div>

      {/* Layout en deux colonnes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Colonne gauche : Historique des conversations */}
        <div className="lg:col-span-1 card flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("contact.conversations")}</h3>
            <button
              onClick={() => setSelectedConversation(null)}
              className="icon-btn"
              aria-label={t("contact.newConversation")}
            >
              +
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted text-sm">{t("contact.noConversations")}</p>
                <p className="text-muted text-xs mt-2">{t("contact.startNewConversation")}</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedConversation === conv.id
                      ? "bg-primary/10 border-primary/40"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{conv.subject}</p>
                      <p className="text-xs text-muted mt-1 truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-muted mt-1">
                        {new Date(conv.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {conv.unread && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Colonne droite : Formulaire de nouveau message ou chat */}
        <div className="lg:col-span-2 card flex flex-col min-h-0">
          {selectedConversation ? (
            // TODO: Afficher les messages de la conversation sélectionnée
            <div className="flex-1 flex flex-col">
              <div className="border-b border-white/10 pb-4 mb-4">
                <h3 className="font-semibold">
                  {conversations.find(c => c.id === selectedConversation)?.subject || t("contact.conversation")}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-muted text-sm text-center py-8">
                  {t("contact.chatNotImplemented")}
                </p>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    className="input-minimal flex-1"
                    placeholder={t("contact.typeMessage")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? t("contact.sending") : t("contact.send")}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Nouveau message
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold mb-4">Nouveau message</h3>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("contact.subject")}</label>
                  <input
                    type="text"
                    className="input-minimal w-full"
                    placeholder={t("contact.subjectPlaceholder")}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium mb-2">{t("contact.message")}</label>
                  <textarea
                    className="input-minimal w-full flex-1 resize-none"
                    placeholder={t("contact.messagePlaceholder")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => router.push("/dashboard")}
                    disabled={loading}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? t("contact.sending") : t("contact.sendMessage")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


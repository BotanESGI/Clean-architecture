"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";

export default function ContactPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { show } = useToast();
  
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
      show("Veuillez entrer un objet", "error");
      return;
    }
    
    if (!message.trim()) {
      show("Veuillez entrer un message", "error");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implémenter l'appel API pour créer le message
      // Pour l'instant, on simule juste un envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      show("Message envoyé avec succès", "success");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      show(err.message || "Erreur lors de l'envoi du message", "error");
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
          <h1 className="text-2xl md:text-3xl font-extrabold">Contactez votre conseiller</h1>
          <p className="text-muted text-sm mt-1">Envoyez un message à votre conseiller bancaire</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-secondary"
        >
          Retour au tableau de bord
        </button>
      </div>

      {/* Layout en deux colonnes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Colonne gauche : Historique des conversations */}
        <div className="lg:col-span-1 card flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Conversations</h3>
            <button
              onClick={() => setSelectedConversation(null)}
              className="icon-btn"
              aria-label="Nouvelle conversation"
            >
              +
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted text-sm">Aucune conversation</p>
                <p className="text-muted text-xs mt-2">Commencez une nouvelle conversation</p>
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
                  {conversations.find(c => c.id === selectedConversation)?.subject || "Conversation"}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-muted text-sm text-center py-8">
                  Les messages de la conversation apparaîtront ici une fois la logique du chat implémentée.
                </p>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    className="input-minimal flex-1"
                    placeholder="Tapez votre message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Envoi..." : "Envoyer"}
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
                  <label className="block text-sm font-medium mb-2">Objet</label>
                  <input
                    type="text"
                    className="input-minimal w-full"
                    placeholder="Ex: Question sur mon compte"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    className="input-minimal w-full flex-1 resize-none"
                    placeholder="Votre message..."
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
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? "Envoi..." : "Envoyer le message"}
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


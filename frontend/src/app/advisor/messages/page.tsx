"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { AdvisorChat } from "../../../components/organisms/AdvisorChat/AdvisorChat";
import { decodeClientId } from "../../../lib/utils";
import api from "../../../lib/api";

interface Conversation {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

export default function AdvisorMessagesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const id = decodeClientId(token);
    if (!id) {
      router.push("/login");
      return;
    }

    setAdvisorId(id);
    loadConversations(id);
  }, [token, router]);

  const loadConversations = async (id: string) => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const url = `${API_URL}/advisor/conversations`;
      console.log("🔄 Chargement des conversations pour advisor:", id);
      console.log("🔗 URL:", url);
      console.log("🔑 Token présent:", !!token);
      
      const data = await api.advisor.listConversations(token);
      console.log("✅ Conversations reçues:", data.conversations?.length || 0);
      setConversations(data.conversations || []);
    } catch (error: any) {
      console.error("❌ Erreur lors du chargement des conversations:", error);
      console.error("   Status:", error.status);
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
      // Afficher un message d'erreur à l'utilisateur
      if (error.message) {
        alert(`Erreur: ${error.message} (Status: ${error.status || 'N/A'})`);
      }
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !advisorId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted">Chargement...</p>
      </div>
    );
  }

  const selectedConversation = conversations.find(c => c.clientId === selectedClientId);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Messages clients</h1>
          <p className="text-muted text-sm mt-1">Répondez aux messages de vos clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des conversations */}
        <div className="lg:col-span-1">
          <div className="glass border border-white/10 rounded-2xl p-4">
            <h3 className="font-semibold mb-4">Conversations</h3>
            {loading ? (
              <p className="text-muted text-sm">Chargement...</p>
            ) : conversations.length === 0 ? (
              <p className="text-muted text-sm">Aucune conversation</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.clientId}
                    onClick={() => setSelectedClientId(conv.clientId)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedClientId === conv.clientId
                        ? "bg-primary/10 border-primary/40"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{conv.clientName}</p>
                        <p className="text-xs text-muted mt-1 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-muted mt-1">
                          {new Date(conv.lastMessageDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="ml-2 bg-primary text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <AdvisorChat
              advisorId={advisorId}
              clientId={selectedConversation.clientId}
              clientName={selectedConversation.clientName}
            />
          ) : (
            <div className="glass border border-white/10 rounded-2xl p-8 flex items-center justify-center h-[600px]">
              <p className="text-muted">Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


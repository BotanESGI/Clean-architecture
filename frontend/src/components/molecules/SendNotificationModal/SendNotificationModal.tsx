"use client";

import { useState } from "react";
import { useToast } from "../../../contexts/ToastContext";
import api from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";

interface SendNotificationModalProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
}

const NOTIFICATION_TEMPLATES = [
  {
    id: "payment_reminder",
    title: "Rappel de paiement",
    message: "Bonjour, nous vous rappelons que votre prochain paiement est prévu le {date}. Merci de vérifier que votre compte dispose des fonds nécessaires.",
  },
  {
    id: "special_offer",
    title: "Offre spéciale",
    message: "Bonjour, nous avons le plaisir de vous informer d'une offre spéciale qui pourrait vous intéresser : {details}",
  },
  {
    id: "account_update",
    title: "Mise à jour de compte",
    message: "Bonjour, votre compte a été mis à jour. Veuillez vérifier les modifications dans votre espace client.",
  },
  {
    id: "meeting_reminder",
    title: "Rappel de rendez-vous",
    message: "Bonjour, nous vous rappelons votre rendez-vous prévu le {date} à {time}. Nous restons à votre disposition pour toute question.",
  },
  {
    id: "custom",
    title: "Notification personnalisée",
    message: "",
  },
];

export function SendNotificationModal({
  clientId,
  clientName,
  isOpen,
  onClose,
  onSent,
}: SendNotificationModalProps) {
  const { token } = useAuth();
  const { show } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = NOTIFICATION_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setTitle(template.title);
      setMessage(template.message);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      show("Le titre et le message sont requis", "error");
      return;
    }

    if (!token) {
      show("Authentification requise", "error");
      return;
    }

    setSending(true);
    try {
      await api.advisor.sendNotification(
        {
          receiverId: clientId,
          title: title.trim(),
          message: message.trim(),
        },
        token
      );
      show("Notification envoyée avec succès", "success");
      setTitle("");
      setMessage("");
      setSelectedTemplate("custom");
      onSent?.();
      onClose();
    } catch (error: any) {
      show(error.message || "Erreur lors de l'envoi de la notification", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Envoyer une notification</h2>
            <p className="text-sm text-muted mt-1">À : {clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition"
            disabled={sending}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Sélection de template */}
          <div>
            <label className="block text-sm font-medium mb-2">Modèle de notification</label>
            <div className="grid grid-cols-2 gap-2">
              {NOTIFICATION_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedTemplate === template.id
                      ? "bg-primary/20 border-primary"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  disabled={sending}
                >
                  <div className="font-medium text-sm">{template.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la notification"
              className="input-dark w-full"
              required
              disabled={sending}
              maxLength={100}
            />
            <p className="text-xs text-muted mt-1">{title.length}/100 caractères</p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message de la notification"
              className="input-dark w-full min-h-[150px] resize-y"
              required
              disabled={sending}
              maxLength={500}
            />
            <p className="text-xs text-muted mt-1">{message.length}/500 caractères</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={sending}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={sending || !title.trim() || !message.trim()}
            >
              {sending ? "Envoi..." : "Envoyer la notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

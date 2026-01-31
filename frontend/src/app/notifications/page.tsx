"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import api from "../../lib/api";

interface Notification {
  id: string;
  receiverId: string;
  senderId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !token) {
      if (mounted && !token) {
        router.push("/login");
      }
      return;
    }

    loadNotifications();
    
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [mounted, token, router]);

  const loadNotifications = async () => {
    if (!token) return;
    
    try {
      const data = await api.notifications.list(token);
      setNotifications(data.notifications);
    } catch (error: any) {
      console.error("Erreur lors du chargement des notifications:", error);
      show(error.message || "Erreur lors du chargement des notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await api.notifications.markAsRead(notificationId, token);
      // Mettre à jour localement
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      
      // Émettre un événement pour mettre à jour le badge
      window.dispatchEvent(new CustomEvent("notification_read"));
    } catch (error: any) {
      show(error.message || "Erreur lors du marquage de la notification", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      await Promise.all(
        unreadNotifications.map((n) => api.notifications.markAsRead(n.id, token))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent("notification_read"));
      show("Toutes les notifications ont été marquées comme lues", "success");
    } catch (error: any) {
      show(error.message || "Erreur lors du marquage des notifications", "error");
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted">Chargement...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Notifications</h1>
          <p className="text-muted text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes vos notifications sont lues"}
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary">
              Tout marquer comme lu
            </button>
          )}
          <a href="/dashboard" className="btn-secondary">
            ← Retour au tableau de bord
          </a>
        </div>
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-muted mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-muted text-lg">Aucune notification</p>
            <p className="text-muted text-sm mt-2">
              Vous serez notifié lorsque votre conseiller vous enverra un message
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-white/5 transition cursor-pointer ${
                  !notification.isRead ? "bg-primary/5 border-l-4 border-primary" : ""
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !notification.isRead
                          ? "bg-primary/20 text-primary"
                          : "bg-white/10 text-muted"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-sm mb-1 ${
                            !notification.isRead ? "text-text" : "text-muted"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted line-clamp-3">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted mt-2">
                          {new Date(notification.createdAt).toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { GroupChat } from "../../../components/organisms/GroupChat/GroupChat";

export default function DirectorGroupChatPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Vérifier l'authentification
    const checkAuth = () => {
      if (typeof window === "undefined") return;
      
      const role = localStorage.getItem("role");
      const storedToken = localStorage.getItem("token");
      
      if (!storedToken || !token || role !== "DIRECTOR") {
        router.push("/login");
        return;
      }
      
      setIsChecking(false);
    };
    
    // Vérifier après un court délai pour s'assurer que le token est chargé
    const timeout = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timeout);
  }, [mounted, token, router]);

  if (!mounted || isChecking) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Discussion de groupe</h1>
          <p className="text-muted text-sm mt-1">Communiquez avec tous les conseillers et directeurs en temps réel</p>
        </div>
        <a href="/director/dashboard" className="btn-secondary">
          ← Retour au tableau de bord
        </a>
      </div>

      <div className="h-[calc(100vh-250px)] min-h-[600px]">
        <GroupChat />
      </div>
    </div>
  );
}

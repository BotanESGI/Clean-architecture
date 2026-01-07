"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import api from "../../../lib/api";
import Link from "next/link";
import { useToast } from "../../../contexts/ToastContext";
import { useTranslation } from "../../../hooks/useTranslation";

export default function ConfirmPage() {
  const params = useParams();
  const token = params?.token as string;
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>("Confirmation en cours...");
  const [ok, setOk] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCalledRef = useRef(false);
  const { show } = useToast();

  useEffect(() => {
    if (!token || hasCalledRef.current) {
      if (!token) {
        setMessage("Lien de confirmation invalide");
        setOk(false);
        setIsLoading(false);
      }
      return;
    }
    
    hasCalledRef.current = true;
    let cancelled = false;
    setIsLoading(true);
    
    api.confirm(token)
      .then((res) => {
        if (cancelled) return;
        let successMessage = res.message || "Compte confirmé avec succès";
        if (successMessage.includes("déjà confirmé")) {
          successMessage = "Votre compte est déjà confirmé. Vous pouvez vous connecter.";
        }
        setMessage(successMessage);
        setOk(true);
        setIsLoading(false);
        show(successMessage, "success");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        let errorMessage = "Lien de confirmation invalide";
        let isSuccess = false;
        
        if (e instanceof Error) {
          errorMessage = e.message;
          if (errorMessage.toLowerCase().includes("déjà confirmé") || 
              errorMessage.toLowerCase().includes("déjà vérifié") ||
              errorMessage.toLowerCase().includes("déjà")) {
            isSuccess = true;
            errorMessage = "Votre compte est déjà confirmé. Vous pouvez vous connecter.";
            show("Compte déjà confirmé", "success");
          }
        } else if ((e as any)?.status === 400) {
          const errorData = (e as any)?.response || (e as any);
          if (errorData?.message) {
            errorMessage = errorData.message;
            if (errorMessage.toLowerCase().includes("déjà confirmé") || 
                errorMessage.toLowerCase().includes("déjà vérifié")) {
              isSuccess = true;
              errorMessage = "Votre compte est déjà confirmé. Vous pouvez vous connecter.";
              show("Compte déjà confirmé", "success");
            }
          }
        }
        
        setMessage(errorMessage);
        setOk(isSuccess);
        setIsLoading(false);
        if (!isSuccess) {
          show(errorMessage, "error");
        }
      });
      
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold mb-2">{t("confirm.title")}</h1>
          <p className="text-muted">{t("confirm.confirming")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-2">{ok ? t("confirm.successTitle") : t("confirm.title")}</h1>
        <p className={ok === false ? "text-red-500" : ok === true ? "text-green-500" : "text-muted"}>{message}</p>
        {ok && (
          <p className="text-muted mt-2">{t("confirm.canLogin")}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/login" className="btn-primary">{t("nav.login")}</Link>
          <Link href="/" className="btn-secondary">{t("nav.home")}</Link>
        </div>
      </div>
    </div>
  );
}



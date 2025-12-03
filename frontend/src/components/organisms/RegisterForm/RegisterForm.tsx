"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../../../lib/validations/auth";
import { FormField } from "../../molecules/FormField";
import { Button } from "../../atoms/Button";
import { Alert } from "../../atoms/Alert";
import { useToast } from "../../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { useState } from "react";

export function RegisterForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const { show } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");
  const requirements = {
    length: password ? password.length >= 8 : false,
    upper: password ? /[A-Z]/.test(password) : false,
    lower: password ? /[a-z]/.test(password) : false,
    digit: password ? /\d/.test(password) : false,
    special: password ? /[^A-Za-z0-9]/.test(password) : false,
  };
  const passwordValid = Object.values(requirements).every(Boolean);

  const onSubmit = async (data: RegisterFormData) => {
    setMessage("");
    setIsSuccess(false);
    
    try {
      const res = await api.register(data);
      const msg = res.message + " Vérifiez votre email pour confirmer votre compte.";
      setMessage(msg);
      setIsSuccess(true);
      show("Inscription réussie. Vérifiez votre email.", "success");
      router.push(`/register/sent?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setMessage(msg);
      setIsSuccess(false);
      show(msg, "error");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {message && (
        <Alert type={isSuccess ? "success" : "error"}>{message}</Alert>
      )}
      
      <FormField
        label="Prénom"
        type="text"
        {...register("firstname")}
        error={errors.firstname}
      />
      
      <FormField
        label="Nom"
        type="text"
        {...register("lastname")}
        error={errors.lastname}
      />
      
      <FormField
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email}
      />
      
      <div className="field">
        <FormField
          label="Mot de passe"
          type="password"
          {...register("password")}
          error={errors.password}
        />
        {!errors.password && (
          <p className="helper">8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial.</p>
        )}
      </div>
      
      <ul className="text-xs text-muted grid grid-cols-2 gap-2">
        <li className={requirements.length ? "text-text" : "text-muted"}>8+ caractères</li>
        <li className={requirements.upper ? "text-text" : "text-muted"}>1 majuscule</li>
        <li className={requirements.lower ? "text-text" : "text-muted"}>1 minuscule</li>
        <li className={requirements.digit ? "text-text" : "text-muted"}>1 chiffre</li>
        <li className={requirements.special ? "text-text" : "text-muted"}>1 caractère spécial</li>
      </ul>
      
      <Button 
        type="submit" 
        isLoading={isSubmitting} 
        className="w-full disabled:opacity-50" 
        disabled={!passwordValid}
      >
        S&apos;inscrire
      </Button>
    </form>
  );
}


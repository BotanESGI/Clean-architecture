"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../../../lib/validations/auth";
import { FormField } from "../../molecules/FormField";
import { Button } from "../../atoms/Button";
import { Alert } from "../../atoms/Alert";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { useState } from "react";

export function LoginForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const { setToken } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setMessage("");
    setIsSuccess(false);
    
    try {
      const res = await api.login(data);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      setToken(res.token);
      setMessage("Connexion réussie !");
      setIsSuccess(true);
      show("Connexion réussie", "success");

      // Redirection selon le rôle
      if (res.role === "DIRECTOR") {
        router.push("/director/dashboard");
      } else if (res.role === "ADVISOR") {
        router.push("/advisor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la connexion";
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
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email}
      />
      
      <FormField
        label="Mot de passe"
        type="password"
        {...register("password")}
        error={errors.password}
      />
      
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Se connecter
      </Button>
    </form>
  );
}


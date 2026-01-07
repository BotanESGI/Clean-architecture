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
import { useTranslation } from "../../../hooks/useTranslation";
import api from "../../../lib/api";
import { useState } from "react";

export function LoginForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const { setToken } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setMessage("");
    setIsSuccess(false);
    
    api.login(data)
      .then((res) => {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        setToken(res.token);
        setMessage(t("auth.loginSuccess") + " !");
        setIsSuccess(true);
        show(t("auth.loginSuccess"), "success");

        if (res.role === "DIRECTOR") {
          router.push("/director/dashboard");
        } else if (res.role === "ADVISOR") {
          router.push("/advisor/dashboard");
        } else {
          router.push("/dashboard");
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : t("auth.loginError");
        setMessage(msg);
        setIsSuccess(false);
        show(msg, "error");
      });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {message && (
        <Alert type={isSuccess ? "success" : "error"}>{message}</Alert>
      )}
      
      <FormField
        label={t("auth.email")}
        type="email"
        {...register("email")}
        error={errors.email}
      />
      
      <FormField
        label={t("auth.password")}
        type="password"
        {...register("password")}
        error={errors.password}
      />
      
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {t("nav.login")}
      </Button>
    </form>
  );
}


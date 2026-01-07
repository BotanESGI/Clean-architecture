"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../../../lib/validations/auth";
import { FormField } from "../../molecules/FormField";
import { Button } from "../../atoms/Button";
import { Alert } from "../../atoms/Alert";
import { useToast } from "../../../contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../../hooks/useTranslation";
import api from "../../../lib/api";
import { useState } from "react";

export function RegisterForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const { show } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

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

  const onSubmit = (data: RegisterFormData) => {
    setMessage("");
    setIsSuccess(false);
    
    api.register(data)
      .then((res) => {
        const msg = res.message + " " + t("auth.checkEmailConfirm");
        setMessage(msg);
        setIsSuccess(true);
        show(t("auth.registerSuccess"), "success");
        router.push(`/register/sent?email=${encodeURIComponent(data.email)}`);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : t("auth.registerError");
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
        label={t("auth.firstName")}
        type="text"
        {...register("firstname")}
        error={errors.firstname}
      />
      
      <FormField
        label={t("auth.lastName")}
        type="text"
        {...register("lastname")}
        error={errors.lastname}
      />
      
      <FormField
        label={t("auth.email")}
        type="email"
        {...register("email")}
        error={errors.email}
      />
      
      <div className="field">
        <FormField
          label={t("auth.password")}
          type="password"
          {...register("password")}
          error={errors.password}
        />
        {!errors.password && (
          <p className="helper">{t("auth.passwordRequirements")}</p>
        )}
      </div>
      
      <ul className="text-xs text-muted grid grid-cols-2 gap-2">
        <li className={requirements.length ? "text-text" : "text-muted"}>{t("auth.passwordRequirementLength")}</li>
        <li className={requirements.upper ? "text-text" : "text-muted"}>{t("auth.passwordRequirementUpper")}</li>
        <li className={requirements.lower ? "text-text" : "text-muted"}>{t("auth.passwordRequirementLower")}</li>
        <li className={requirements.digit ? "text-text" : "text-muted"}>{t("auth.passwordRequirementDigit")}</li>
        <li className={requirements.special ? "text-text" : "text-muted"}>{t("auth.passwordRequirementSpecial")}</li>
      </ul>
      
      <Button 
        type="submit" 
        isLoading={isSubmitting} 
        className="w-full disabled:opacity-50" 
        disabled={!passwordValid}
      >
        {t("auth.signUp")}
      </Button>
    </form>
  );
}


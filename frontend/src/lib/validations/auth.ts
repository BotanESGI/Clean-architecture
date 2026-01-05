import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide").min(1, "Email requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
});

export const transferSchema = z.object({
  toIban: z.string().min(1, "IBAN destinataire requis"),
  amount: z.number().positive("Le montant doit être positif").min(0.01, "Montant minimum: 0.01€"),
});

export const accountSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  type: z.enum(["checking", "savings"]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;


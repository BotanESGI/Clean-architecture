// Constantes pour la politique de mot de passe
// Évite les valeurs magiques comme 8, /[A-Z]/, etc.

export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_DIGIT: true,
  REQUIRE_SPECIAL: true,
} as const;

export const PASSWORD_PATTERNS = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  DIGIT: /\d/,
  SPECIAL: /[^A-Za-z0-9]/,
} as const;

export const PASSWORD_ERROR_MESSAGES = {
  TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères",
  MISSING_UPPERCASE: "Le mot de passe doit contenir au moins une majuscule",
  MISSING_LOWERCASE: "Le mot de passe doit contenir au moins une minuscule",
  MISSING_DIGIT: "Le mot de passe doit contenir au moins un chiffre",
  MISSING_SPECIAL: "Le mot de passe doit contenir au moins un caractère spécial",
  INVALID: "Mot de passe invalide. Exigences: 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.",
} as const;


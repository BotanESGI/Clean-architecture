import { Result, success, failure } from "../value-objects/Result";
import { PASSWORD_POLICY, PASSWORD_PATTERNS, PASSWORD_ERROR_MESSAGES } from "../constants/PasswordPolicy";

export class PasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordValidationError";
  }
}

// Valide le mot de passe selon les règles définies
// Fonction pure donc facile à tester
export function validatePassword(password: string): Result<string, PasswordValidationError> {
  if (!password) {
    return failure(new PasswordValidationError(PASSWORD_ERROR_MESSAGES.INVALID));
  }

  if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
    return failure(new PasswordValidationError(PASSWORD_ERROR_MESSAGES.TOO_SHORT));
  }

  if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !PASSWORD_PATTERNS.UPPERCASE.test(password)) {
    return failure(new PasswordValidationError(PASSWORD_ERROR_MESSAGES.MISSING_UPPERCASE));
  }

  if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !PASSWORD_PATTERNS.LOWERCASE.test(password)) {
    return failure(new PasswordValidationError(PASSWORD_ERROR_MESSAGES.MISSING_LOWERCASE));
  }

  if (PASSWORD_POLICY.REQUIRE_DIGIT && !PASSWORD_PATTERNS.DIGIT.test(password)) {
    return failure(new PasswordValidationError(PASSWORD_ERROR_MESSAGES.MISSING_DIGIT));
  }

  if (PASSWORD_POLICY.REQUIRE_SPECIAL && !PASSWORD_PATTERNS.SPECIAL.test(password)) {
    return failure(new PasswordValidationError(PASSWORD_ERROR_MESSAGES.MISSING_SPECIAL));
  }

  return success(password);
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidationError = void 0;
exports.validatePassword = validatePassword;
const Result_1 = require("../value-objects/Result");
const PasswordPolicy_1 = require("../constants/PasswordPolicy");
class PasswordValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "PasswordValidationError";
    }
}
exports.PasswordValidationError = PasswordValidationError;
// Valide le mot de passe selon les règles définies
// Fonction pure donc facile à tester
function validatePassword(password) {
    if (!password) {
        return (0, Result_1.failure)(new PasswordValidationError(PasswordPolicy_1.PASSWORD_ERROR_MESSAGES.INVALID));
    }
    if (password.length < PasswordPolicy_1.PASSWORD_POLICY.MIN_LENGTH) {
        return (0, Result_1.failure)(new PasswordValidationError(PasswordPolicy_1.PASSWORD_ERROR_MESSAGES.TOO_SHORT));
    }
    if (PasswordPolicy_1.PASSWORD_POLICY.REQUIRE_UPPERCASE && !PasswordPolicy_1.PASSWORD_PATTERNS.UPPERCASE.test(password)) {
        return (0, Result_1.failure)(new PasswordValidationError(PasswordPolicy_1.PASSWORD_ERROR_MESSAGES.MISSING_UPPERCASE));
    }
    if (PasswordPolicy_1.PASSWORD_POLICY.REQUIRE_LOWERCASE && !PasswordPolicy_1.PASSWORD_PATTERNS.LOWERCASE.test(password)) {
        return (0, Result_1.failure)(new PasswordValidationError(PasswordPolicy_1.PASSWORD_ERROR_MESSAGES.MISSING_LOWERCASE));
    }
    if (PasswordPolicy_1.PASSWORD_POLICY.REQUIRE_DIGIT && !PasswordPolicy_1.PASSWORD_PATTERNS.DIGIT.test(password)) {
        return (0, Result_1.failure)(new PasswordValidationError(PasswordPolicy_1.PASSWORD_ERROR_MESSAGES.MISSING_DIGIT));
    }
    if (PasswordPolicy_1.PASSWORD_POLICY.REQUIRE_SPECIAL && !PasswordPolicy_1.PASSWORD_PATTERNS.SPECIAL.test(password)) {
        return (0, Result_1.failure)(new PasswordValidationError(PasswordPolicy_1.PASSWORD_ERROR_MESSAGES.MISSING_SPECIAL));
    }
    return (0, Result_1.success)(password);
}

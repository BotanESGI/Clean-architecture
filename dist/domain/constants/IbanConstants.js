"use strict";
// Constantes pour générer les IBAN
// Remplace les valeurs magiques comme '30002', 97, etc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBAN_CONSTANTS = void 0;
exports.IBAN_CONSTANTS = {
    FR_BANK_CODE: '30002',
    FR_BRANCH_CODE: '01234',
    CHECK_DIGIT_PADDING: '00',
    FR_COUNTRY_CODE: 'FR',
    MODULO_BASE: 97,
    MODULO_TARGET: 1,
    CHECK_DIGIT_BASE: 98,
};

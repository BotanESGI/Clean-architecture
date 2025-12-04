import { IBAN_CONSTANTS } from "../constants/IbanConstants";

// Value Object pour gérer les IBAN avec validation
export class IBAN {
    static isValid(iban: string): boolean {
        const normalized = iban.replace(/\s+/g, '').toUpperCase();
        if (!/^[A-Z0-9]+$/.test(normalized)) return false;
        const rearr = normalized.slice(4) + normalized.slice(0, 4);
        const converted = rearr.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
        let remainder = 0;
        for (let i = 0; i < converted.length; i += 7) {
            remainder = Number(remainder.toString() + converted.slice(i, i + 7)) % IBAN_CONSTANTS.MODULO_BASE;
        }
        return remainder === IBAN_CONSTANTS.MODULO_TARGET;
    }

    static generateFR(): string {
        const bank = IBAN_CONSTANTS.FR_BANK_CODE;
        const branch = IBAN_CONSTANTS.FR_BRANCH_CODE;
        const account = Math.random().toString(36).substring(2, 13).toUpperCase();
        const rib = bank + branch + account + IBAN_CONSTANTS.CHECK_DIGIT_PADDING;
        const base = rib + IBAN_CONSTANTS.FR_COUNTRY_CODE + IBAN_CONSTANTS.CHECK_DIGIT_PADDING;
        const converted = base.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
        let remainder = 0;
        for (let i = 0; i < converted.length; i += 7) {
            remainder = Number(remainder.toString() + converted.slice(i, i + 7)) % IBAN_CONSTANTS.MODULO_BASE;
        }
        const check = (IBAN_CONSTANTS.CHECK_DIGIT_BASE - remainder).toString().padStart(2, '0');
        return `${IBAN_CONSTANTS.FR_COUNTRY_CODE}${check}${rib}`;
    }
}

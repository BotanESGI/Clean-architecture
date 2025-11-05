"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBAN = void 0;
class IBAN {
    static isValid(iban) {
        const normalized = iban.replace(/\s+/g, '').toUpperCase();
        if (!/^[A-Z0-9]+$/.test(normalized))
            return false;
        const rearr = normalized.slice(4) + normalized.slice(0, 4);
        const converted = rearr.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
        let remainder = 0;
        for (let i = 0; i < converted.length; i += 7) {
            remainder = Number(remainder.toString() + converted.slice(i, i + 7)) % 97;
        }
        return remainder === 1;
    }
    static generateFR() {
        const bank = '30002', branch = '01234';
        const account = Math.random().toString(36).substring(2, 13).toUpperCase();
        const rib = bank + branch + account + '00';
        const base = rib + 'FR00';
        const converted = base.replace(/[A-Z]/g, ch => (ch.charCodeAt(0) - 55).toString());
        let remainder = 0;
        for (let i = 0; i < converted.length; i += 7) {
            remainder = Number(remainder.toString() + converted.slice(i, i + 7)) % 97;
        }
        const check = (98 - remainder).toString().padStart(2, '0');
        return `FR${check}${rib}`;
    }
}
exports.IBAN = IBAN;

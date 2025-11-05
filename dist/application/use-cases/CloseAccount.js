"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseAccount = void 0;
class CloseAccount {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(id) {
        const acc = await this.repo.findById(id);
        if (!acc)
            throw new Error("Compte introuvable");
        acc.close();
        await this.repo.update(acc);
        return { success: true };
    }
}
exports.CloseAccount = CloseAccount;

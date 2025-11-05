"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameAccount = void 0;
class RenameAccount {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(id, name) {
        if (!name || name.trim().length < 2)
            throw new Error("Nom invalide");
        const acc = await this.repo.findById(id);
        if (!acc)
            throw new Error("Compte introuvable");
        acc.rename(name.trim());
        await this.repo.update(acc);
        return acc;
    }
}
exports.RenameAccount = RenameAccount;

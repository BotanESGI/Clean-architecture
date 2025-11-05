"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
class AccountController {
    constructor(createAccount, renameAccount, closeAccount, accountRepo) {
        this.createAccount = createAccount;
        this.renameAccount = renameAccount;
        this.closeAccount = closeAccount;
        this.accountRepo = accountRepo;
        // POST /accounts
        this.create = async (req, res) => {
            const { clientId, name, type } = req.body || {};
            if (!clientId)
                return res.status(400).json({ error: "clientId requis" });
            const acc = await this.createAccount.execute({ ownerId: clientId, name, type });
            // Serialize account with createdAt as ISO string
            res.status(201).json({
                id: acc.id,
                clientId: acc.clientId,
                iban: acc.iban,
                name: acc.name,
                balance: acc.balance,
                createdAt: acc.createdAt ? acc.createdAt.toISOString() : undefined,
            });
        };
        // PATCH /accounts/:id
        this.rename = async (req, res) => {
            const { id } = req.params;
            const { name } = req.body || {};
            if (!name)
                return res.status(400).json({ error: "name requis" });
            const acc = await this.renameAccount.execute(id, name);
            res.status(200).json(acc);
        };
        // DELETE /accounts/:id
        this.close = async (req, res) => {
            const { id } = req.params;
            const acc = await this.accountRepo.findById(id);
            if (!acc)
                return res.status(404).json({ error: "Compte introuvable" });
            // Fermer puis supprimer complètement
            await this.closeAccount.execute(id);
            await this.accountRepo.delete(acc.iban);
            res.status(200).json({ success: true });
        };
        // GET /accounts?clientId=...
        this.listByClient = async (req, res) => {
            const clientId = req.query.clientId || "";
            if (!clientId)
                return res.status(400).json({ error: "clientId requis" });
            const accounts = await this.accountRepo.findByOwnerId(clientId);
            // Serialize accounts with createdAt as ISO string
            const serialized = accounts.map(acc => ({
                id: acc.id,
                clientId: acc.clientId,
                iban: acc.iban,
                name: acc.name,
                balance: acc.balance,
                createdAt: acc.createdAt ? acc.createdAt.toISOString() : undefined,
            }));
            res.status(200).json(serialized);
        };
        // GET /accounts/:clientId/balance -> returns primary account balance
        this.getBalance = async (req, res) => {
            const { clientId } = req.params;
            if (!clientId)
                return res.status(400).json({ error: "clientId requis" });
            const accounts = await this.accountRepo.findByOwnerId(clientId);
            if (!accounts || accounts.length === 0)
                return res.status(404).json({ error: "Aucun compte trouvé" });
            const primary = accounts[0];
            res.status(200).json({ accountId: primary.id, balance: primary.balance });
        };
        // GET /accounts/:clientId/iban -> returns primary account IBAN
        this.getIban = async (req, res) => {
            const { clientId } = req.params;
            if (!clientId)
                return res.status(400).json({ error: "clientId requis" });
            const accounts = await this.accountRepo.findByOwnerId(clientId);
            if (!accounts || accounts.length === 0)
                return res.status(404).json({ error: "Aucun compte trouvé" });
            const primary = accounts[0];
            res.status(200).json({ accountId: primary.id, iban: primary.iban, name: primary.name });
        };
    }
}
exports.AccountController = AccountController;

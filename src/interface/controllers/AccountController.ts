// src/interface/controllers/AccountController.ts
import { Request, Response } from "express";
import { CreateAccount } from "../../application/use-cases/CreateAccount";
import { RenameAccount } from "../../application/use-cases/RenameAccount";
import { CloseAccount } from "../../application/use-cases/CloseAccount";
import { AccountRepository } from "../../application/repositories/AccountRepository";

export class AccountController {
  constructor(
    private createAccount: CreateAccount,
    private renameAccount: RenameAccount,
    private closeAccount: CloseAccount,
    private accountRepo: AccountRepository
  ) {}

  // POST /accounts
  create = async (req: Request, res: Response) => {
    const { clientId, name, type } = req.body || {};
    if (!clientId) return res.status(400).json({ error: "clientId requis" });

    const acc = await this.createAccount.execute({ ownerId: clientId, name, type });
    res.status(201).json(acc);
  };

  // PATCH /accounts/:id
  rename = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "name requis" });
    const acc = await this.renameAccount.execute(id, name);
    res.status(200).json(acc);
  };

  // DELETE /accounts/:id
  close = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.closeAccount.execute(id);
    res.status(200).json(result);
  };

  // GET /accounts?clientId=...
  listByClient = async (req: Request, res: Response) => {
    const clientId = (req.query.clientId as string) || "";
    if (!clientId) return res.status(400).json({ error: "clientId requis" });

    const accounts = await this.accountRepo.findByOwnerId(clientId);
    res.status(200).json(accounts);
  };
}

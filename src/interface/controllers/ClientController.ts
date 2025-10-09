import { Request, Response } from "express";
import { RegisterClient } from "../../application/use-cases/RegisterClient";
import { ConfirmClientRegistration } from "../../application/use-cases/ConfirmRegistration";

export class ClientController {
  constructor(
    private registerClient: RegisterClient,
    private confirmClient: ConfirmClientRegistration
  ) {}

  register = async (req: Request, res: Response) => {
    const { firstname, lastname, email, password } = req.body;
    const client = await this.registerClient.execute(firstname, lastname, email, password);
    res.status(201).json({ message: "Client enregistré, lien envoyé par email", client });
  };

  confirm = async (req: Request, res: Response) => {
    const { id } = req.params;
    const account = await this.confirmClient.execute(id);
    res.status(200).json({
      message: "Compte confirmé avec succès",
      account
    });
  };
}

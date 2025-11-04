import { Request, Response } from "express";
import { TransferFunds } from "../../application/use-cases/TransferFunds";
import { VerifyBeneficiary } from "../../application/use-cases/VerifyBeneficiary";

export class TransferController {
  constructor(
    private transferFunds: TransferFunds,
    private verifyBeneficiary: VerifyBeneficiary
  ) {}

  // POST /transfers
  transfer = async (req: Request, res: Response) => {
    try {
      const { fromIban, toIban, amount } = req.body;
      if (!fromIban || !toIban || !amount) {
        return res.status(400).json({ error: "fromIban, toIban et amount requis" });
      }
      const result = await this.transferFunds.execute(fromIban, toIban, amount);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  // POST /beneficiaries/verify
  verify = async (req: Request, res: Response) => {
    try {
      const { iban, firstName, lastName } = req.body;
      if (!iban) {
        return res.status(400).json({ error: "iban requis" });
      }
      const result = await this.verifyBeneficiary.execute(iban, firstName, lastName);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}


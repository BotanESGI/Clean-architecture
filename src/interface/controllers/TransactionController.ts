import { Request, Response } from "express";
import { ListTransactions } from "../../application/use-cases/ListTransactions";

export class TransactionController {
  constructor(private listTransactions: ListTransactions) {}

  // GET /transactions?accountIds=...
  list = async (req: Request, res: Response) => {
    try {
      const accountIdsParam = req.query.accountIds as string;
      if (!accountIdsParam) {
        return res.status(400).json({ error: "accountIds requis" });
      }
      const accountIds = accountIdsParam.split(",").filter(id => id.trim());
      const transactions = await this.listTransactions.execute(accountIds);
      res.status(200).json(transactions);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
class TransactionController {
    constructor(listTransactions) {
        this.listTransactions = listTransactions;
        // GET /transactions?accountIds=...
        this.list = async (req, res) => {
            try {
                const accountIdsParam = req.query.accountIds;
                if (!accountIdsParam) {
                    return res.status(400).json({ error: "accountIds requis" });
                }
                const accountIds = accountIdsParam.split(",").filter(id => id.trim());
                const transactions = await this.listTransactions.execute(accountIds);
                res.status(200).json(transactions);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
    }
}
exports.TransactionController = TransactionController;

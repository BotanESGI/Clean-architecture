"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferController = void 0;
class TransferController {
    constructor(transferFunds, verifyBeneficiary) {
        this.transferFunds = transferFunds;
        this.verifyBeneficiary = verifyBeneficiary;
        // POST /transfers
        this.transfer = async (req, res) => {
            try {
                const { fromIban, toIban, amount } = req.body;
                if (!fromIban || !toIban || !amount) {
                    return res.status(400).json({ error: "fromIban, toIban et amount requis" });
                }
                const result = await this.transferFunds.execute(fromIban, toIban, amount);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        // POST /beneficiaries/verify
        this.verify = async (req, res) => {
            try {
                const { iban, firstName, lastName } = req.body;
                if (!iban) {
                    return res.status(400).json({ error: "iban requis" });
                }
                const result = await this.verifyBeneficiary.execute(iban, firstName, lastName);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
    }
}
exports.TransferController = TransferController;

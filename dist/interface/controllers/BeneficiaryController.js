"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiaryController = void 0;
class BeneficiaryController {
    constructor(addBeneficiary, listBeneficiaries, deleteBeneficiary) {
        this.addBeneficiary = addBeneficiary;
        this.listBeneficiaries = listBeneficiaries;
        this.deleteBeneficiary = deleteBeneficiary;
        // POST /beneficiaries
        this.create = async (req, res) => {
            try {
                const { ownerClientId, iban, firstName, lastName, forceWithMismatch } = req.body;
                if (!ownerClientId || !iban || !firstName || !lastName) {
                    return res.status(400).json({ error: "ownerClientId, iban, firstName et lastName requis" });
                }
                const result = await this.addBeneficiary.execute({
                    ownerClientId,
                    iban,
                    firstName,
                    lastName,
                    forceWithMismatch: forceWithMismatch === true
                });
                // Si c'est une demande de confirmation
                if (result.needsConfirmation) {
                    return res.status(400).json({
                        needsConfirmation: true,
                        message: result.message,
                        actualFirstName: result.actualFirstName,
                        actualLastName: result.actualLastName,
                        accountName: result.accountName,
                    });
                }
                res.status(201).json(result);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        // GET /beneficiaries?ownerClientId=...
        this.list = async (req, res) => {
            try {
                const ownerClientId = req.query.ownerClientId || "";
                if (!ownerClientId) {
                    return res.status(400).json({ error: "ownerClientId requis" });
                }
                const beneficiaries = await this.listBeneficiaries.execute(ownerClientId);
                res.status(200).json(beneficiaries);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        // DELETE /beneficiaries/:id
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                const { ownerClientId } = req.body;
                if (!ownerClientId) {
                    return res.status(400).json({ error: "ownerClientId requis dans le body" });
                }
                await this.deleteBeneficiary.execute(id, ownerClientId);
                res.status(200).json({ success: true });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
    }
}
exports.BeneficiaryController = BeneficiaryController;

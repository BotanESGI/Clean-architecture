import { Request, Response } from "express";
import { AddBeneficiary } from "../../application/use-cases/AddBeneficiary";
import { ListBeneficiaries } from "../../application/use-cases/ListBeneficiaries";
import { DeleteBeneficiary } from "../../application/use-cases/DeleteBeneficiary";

export class BeneficiaryController {
  constructor(
    private addBeneficiary: AddBeneficiary,
    private listBeneficiaries: ListBeneficiaries,
    private deleteBeneficiary: DeleteBeneficiary
  ) {}

  // POST /beneficiaries
  create = async (req: Request, res: Response) => {
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
      if ((result as any).needsConfirmation) {
        return res.status(400).json({ 
          needsConfirmation: true,
          message: (result as any).message,
          actualFirstName: (result as any).actualFirstName,
          actualLastName: (result as any).actualLastName,
          accountName: (result as any).accountName,
        });
      }
      
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  // GET /beneficiaries?ownerClientId=...
  list = async (req: Request, res: Response) => {
    try {
      const ownerClientId = (req.query.ownerClientId as string) || "";
      if (!ownerClientId) {
        return res.status(400).json({ error: "ownerClientId requis" });
      }
      const beneficiaries = await this.listBeneficiaries.execute(ownerClientId);
      res.status(200).json(beneficiaries);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  // DELETE /beneficiaries/:id
  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { ownerClientId } = req.body;
      if (!ownerClientId) {
        return res.status(400).json({ error: "ownerClientId requis dans le body" });
      }
      await this.deleteBeneficiary.execute(id, ownerClientId);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}


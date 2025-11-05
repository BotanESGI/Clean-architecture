"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
class ClientController {
    constructor(registerClient, confirmClient, loginClient, clientRepo) {
        this.registerClient = registerClient;
        this.confirmClient = confirmClient;
        this.loginClient = loginClient;
        this.clientRepo = clientRepo;
        this.register = async (req, res) => {
            try {
                const { firstname, lastname, email, password } = req.body;
                const client = await this.registerClient.execute(firstname, lastname, email, password);
                res.status(201).json({ message: "Client enregistré, lien envoyé par email", client });
            }
            catch (err) {
                res.status(400).json({ message: err?.message || "Erreur lors de l'inscription" });
            }
        };
        this.confirm = async (req, res) => {
            const { token } = req.params;
            const account = await this.confirmClient.execute(token);
            res.status(200).json({
                message: "Compte confirmé avec succès",
                account
            });
        };
        this.login = async (req, res) => {
            const { email, password } = req.body;
            try {
                const token = await this.loginClient.execute(email, password);
                res.status(200).json({ message: "Connexion réussie", token });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        // GET /clients/:id → minimal profile
        this.getById = async (req, res) => {
            const { id } = req.params;
            if (!this.clientRepo)
                return res.status(500).json({ message: "Repo manquant" });
            const c = await this.clientRepo.findById(id);
            if (!c)
                return res.status(404).json({ message: "Client introuvable" });
            res.status(200).json({ id: c.getId(), firstname: c.getFirstName(), lastname: c.getLastName(), email: c.getEmail(), verified: c.getIsVerified() });
        };
    }
}
exports.ClientController = ClientController;

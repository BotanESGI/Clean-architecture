"use strict";
// Exemple de comment utiliser Result dans un contrôleur HTTP
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClientController = void 0;
exports.handleRegisterClient = handleRegisterClient;
class RegisterClientController {
    constructor(registerClient) {
        this.registerClient = registerClient;
    }
    async handle(req, res) {
        const { firstName, lastName, email, password } = req.body;
        const result = await this.registerClient.execute(firstName, lastName, email, password);
        // Si erreur, on retourne le code HTTP approprié
        if (result.isFailure) {
            res.status(400).json({
                success: false,
                error: result.error.message,
            });
            return;
        }
        // Sinon on retourne le client créé
        const client = result.value;
        res.status(201).json({
            success: true,
            data: {
                id: client.getId(),
                email: client.getEmail(),
                firstName: client.getFirstName(),
                lastName: client.getLastName(),
            },
        });
    }
}
exports.RegisterClientController = RegisterClientController;
// Alternative en fonction simple
async function handleRegisterClient(req, res, registerClient) {
    const { firstName, lastName, email, password } = req.body;
    const result = await registerClient.execute(firstName, lastName, email, password);
    if (result.isFailure) {
        const statusCode = getStatusCodeFromError(result.error);
        res.status(statusCode).json({
            success: false,
            error: result.error.message,
        });
        return;
    }
    res.status(201).json({
        success: true,
        data: result.value,
    });
}
// Détermine le bon code HTTP selon le type d'erreur
function getStatusCodeFromError(error) {
    if (error.name === "PasswordValidationError")
        return 400;
    if (error.name === "RegisterClientError") {
        if (error.message.includes("déjà utilisé"))
            return 409; // Conflict
        return 400;
    }
    return 500;
}

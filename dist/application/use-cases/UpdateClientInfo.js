"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClientInfo = void 0;
class UpdateClientInfo {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(clientId, data) {
        const client = await this.clientRepository.findById(clientId);
        if (!client)
            throw new Error("Client introuvable");
        if (data.firstName)
            client.setFirstName(data.firstName);
        if (data.lastName)
            client.setLastName(data.lastName);
        if (data.email) {
            const existing = await this.clientRepository.findByEmail(data.email);
            if (existing && existing.getId() !== clientId) {
                throw new Error("Email déjà utilisé");
            }
            client.setEmail(data.email);
        }
        await this.clientRepository.update(client);
    }
}
exports.UpdateClientInfo = UpdateClientInfo;

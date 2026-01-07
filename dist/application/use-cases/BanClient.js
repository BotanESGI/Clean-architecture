"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanClient = void 0;
class BanClient {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client)
            throw new Error("Client introuvable");
        if (client.getIsBanned())
            throw new Error("Client déjà banni");
        client.setIsBanned(true);
        await this.clientRepository.update(client);
    }
}
exports.BanClient = BanClient;

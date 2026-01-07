"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnbanClient = void 0;
class UnbanClient {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client)
            throw new Error("Client introuvable");
        if (!client.getIsBanned())
            throw new Error("Client non banni");
        client.setIsBanned(false);
        await this.clientRepository.update(client);
    }
}
exports.UnbanClient = UnbanClient;

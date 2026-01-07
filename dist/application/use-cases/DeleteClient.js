"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteClient = void 0;
class DeleteClient {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client)
            throw new Error("Client introuvable");
        await this.clientRepository.delete(clientId);
    }
}
exports.DeleteClient = DeleteClient;

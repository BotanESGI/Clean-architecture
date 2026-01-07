"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAllClients = void 0;
class ListAllClients {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute() {
        return await this.clientRepository.findAll();
    }
}
exports.ListAllClients = ListAllClients;

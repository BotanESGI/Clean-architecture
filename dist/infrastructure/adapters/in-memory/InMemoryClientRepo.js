"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryClientRepository = void 0;
class InMemoryClientRepository {
    constructor() {
        this.clients = [];
    }
    async save(client) {
        this.clients.push(client);
    }
    async update(client) {
        const index = this.clients.findIndex(c => c.getId() === client.getId());
        if (index !== -1)
            this.clients[index] = client;
    }
    async findById(id) {
        return this.clients.find(c => c.getId() === id) ?? null;
    }
    async findByEmail(email) {
        return this.clients.find(c => c.getEmail() === email) ?? null;
    }
}
exports.InMemoryClientRepository = InMemoryClientRepository;

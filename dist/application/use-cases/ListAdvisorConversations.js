"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAdvisorConversations = void 0;
class ListAdvisorConversations {
    constructor(messageRepo, clientRepo) {
        this.messageRepo = messageRepo;
        this.clientRepo = clientRepo;
    }
    async execute(advisorId) {
        console.log("🔍 ListAdvisorConversations.execute - advisorId:", advisorId);
        const advisor = await this.clientRepo.findById(advisorId);
        console.log("🔍 Advisor trouvé:", advisor ? `${advisor.getFirstName()} ${advisor.getLastName()} (${advisor.getRole()})` : "null");
        if (!advisor || advisor.getRole() !== "ADVISOR") {
            throw new Error("Conseiller introuvable");
        }
        // Récupérer tous les messages où le conseiller est impliqué (en tant que sender ou receiver)
        const allMessages = await this.messageRepo.findAllByReceiver(advisorId);
        console.log("📨 Messages trouvés:", allMessages.length);
        // Grouper par client (identifier le client comme étant celui qui n'est pas le conseiller)
        const conversationsMap = new Map();
        for (const message of allMessages) {
            // Identifier le client (celui qui n'est pas le conseiller)
            const clientId = message.senderId === advisorId ? message.receiverId : message.senderId;
            // Ne garder que les clients (pas les autres conseillers)
            if (clientId === advisorId)
                continue;
            if (!conversationsMap.has(clientId)) {
                conversationsMap.set(clientId, { clientId, messages: [] });
            }
            conversationsMap.get(clientId).messages.push({
                content: message.content,
                createdAt: message.createdAt,
                isRead: message.isRead,
                senderId: message.senderId,
            });
        }
        // Construire les résumés de conversation
        const summaries = [];
        for (const [clientId, conversation] of conversationsMap.entries()) {
            const client = await this.clientRepo.findById(clientId);
            if (!client || client.getRole() !== "CLIENT")
                continue;
            // Trier les messages par date (plus récent en premier)
            conversation.messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            const lastMessage = conversation.messages[0];
            // Compter uniquement les messages non lus reçus par le conseiller (où le sender n'est pas le conseiller)
            const unreadCount = conversation.messages.filter(m => !m.isRead &&
                m.senderId !== advisorId &&
                m.createdAt <= new Date()).length;
            summaries.push({
                clientId,
                clientName: `${client.getFirstName()} ${client.getLastName()}`,
                clientEmail: client.getEmail() || "",
                lastMessage: lastMessage.content,
                lastMessageDate: lastMessage.createdAt,
                unreadCount,
            });
        }
        // Trier par date du dernier message (plus récent en premier)
        summaries.sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());
        return summaries;
    }
}
exports.ListAdvisorConversations = ListAdvisorConversations;

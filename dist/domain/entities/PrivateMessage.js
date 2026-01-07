"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateMessage = void 0;
class PrivateMessage {
    constructor(id, senderId, receiverId, content, createdAt = new Date(), isRead = false) {
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.createdAt = createdAt;
        this.isRead = isRead;
    }
    markAsRead() {
        return new PrivateMessage(this.id, this.senderId, this.receiverId, this.content, this.createdAt, true);
    }
}
exports.PrivateMessage = PrivateMessage;

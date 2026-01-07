"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
// Route sous /api/v2 pour différencier de Express qui utilise /advisor/notifications
// Note: Le préfixe 'api/v2' est défini globalement dans main.ts, donc on utilise juste 'notifications' ici
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    test() {
        return { message: '✅ NestJS fonctionne ! Route accessible via /api/v2/notifications' };
    }
    async sendNotification(authHeader, body) {
        // Vérifier que le token est présent
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Token manquant');
        }
        // Extraire le token (format "Bearer <token>")
        const token = authHeader.replace('Bearer ', '');
        const { receiverId, title, message } = body;
        // Validation basique des champs requis
        if (!receiverId || !title || !message) {
            throw new common_1.BadRequestException('receiverId, title et message requis');
        }
        try {
            await this.notificationService.sendNotification(token, receiverId, title, message);
            return { message: 'Notification envoyée avec succès' };
        }
        catch (err) {
            // Propager l'erreur avec un message par défaut si nécessaire
            throw new common_1.BadRequestException(err.message || 'Erreur lors de l\'envoi de la notification');
        }
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "test", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendNotification", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);

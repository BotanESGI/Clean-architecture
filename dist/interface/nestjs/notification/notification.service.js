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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const SendNotification_1 = require("../../../application/use-cases/SendNotification");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let NotificationService = class NotificationService {
    constructor(sendNotificationUseCase) {
        this.sendNotificationUseCase = sendNotificationUseCase;
    }
    async sendNotification(token, receiverId, title, message) {
        // Décoder le JWT pour récupérer l'ID du client qui envoie
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const senderId = decoded.clientId;
        // Appeler le use case de la Clean Architecture
        await this.sendNotificationUseCase.execute(senderId, receiverId, title, message);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SendNotification')),
    __metadata("design:paramtypes", [SendNotification_1.SendNotification])
], NotificationService);

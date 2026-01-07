"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("./notification.service");
const SendNotification_1 = require("../../../application/use-cases/SendNotification");
// Module NestJS pour les notifications
// On utilise DynamicModule pour pouvoir injecter les dépendances depuis Express
let NotificationModule = NotificationModule_1 = class NotificationModule {
    static forRoot(clientRepo, callback) {
        return {
            module: NotificationModule_1,
            controllers: [notification_controller_1.NotificationController],
            providers: [
                notification_service_1.NotificationService,
                {
                    provide: 'SendNotification',
                    useFactory: () => {
                        // On crée le use case avec les dépendances passées depuis Express
                        return new SendNotification_1.SendNotification(clientRepo, callback);
                    },
                },
            ],
            exports: ['SendNotification'],
        };
    }
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = NotificationModule_1 = __decorate([
    (0, common_1.Module)({})
], NotificationModule);

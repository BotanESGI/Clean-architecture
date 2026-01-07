import { Module, DynamicModule } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { SendNotification } from '../../../application/use-cases/SendNotification';
import { ClientRepository } from '../../../application/repositories/ClientRepository';

// Module NestJS pour les notifications
// On utilise DynamicModule pour pouvoir injecter les dépendances depuis Express
@Module({})
export class NotificationModule {
  static forRoot(
    clientRepo: ClientRepository,
    callback: (clientId: string, title: string, message: string) => void
  ): DynamicModule {
    return {
      module: NotificationModule,
      controllers: [NotificationController],
      providers: [
        NotificationService,
        {
          provide: 'SendNotification',
          useFactory: () => {
            // On crée le use case avec les dépendances passées depuis Express
            return new SendNotification(clientRepo, callback);
          },
        },
      ],
      exports: ['SendNotification'],
    };
  }
}


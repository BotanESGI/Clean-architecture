import { Injectable, Inject } from '@nestjs/common';
import { SendNotification } from '../../../application/use-cases/SendNotification';
import jwt from 'jsonwebtoken';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('SendNotification')
    private readonly sendNotificationUseCase: SendNotification,
  ) {}

  async sendNotification(token: string, receiverId: string, title: string, message: string): Promise<void> {
    // Décoder le JWT pour récupérer l'ID du client qui envoie
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
    const senderId = decoded.clientId;

    // Appeler le use case de la Clean Architecture
    await this.sendNotificationUseCase.execute(senderId, receiverId, title, message);
  }
}


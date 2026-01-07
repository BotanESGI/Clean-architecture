import { Controller, Post, Get, Body, Headers, HttpCode, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { NotificationService } from './notification.service';

// Route sous /api/v2 pour différencier de Express qui utilise /advisor/notifications
// Note: Le préfixe 'api/v2' est défini globalement dans main.ts, donc on utilise juste 'notifications' ici
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  test() {
    return { message: '✅ NestJS fonctionne ! Route accessible via /api/v2/notifications' };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: { receiverId: string; title: string; message: string },
  ) {
    // Vérifier que le token est présent
    if (!authHeader) {
      throw new UnauthorizedException('Token manquant');
    }

    // Extraire le token (format "Bearer <token>")
    const token = authHeader.replace('Bearer ', '');
    const { receiverId, title, message } = body;

    // Validation basique des champs requis
    if (!receiverId || !title || !message) {
      throw new BadRequestException('receiverId, title et message requis');
    }

    try {
      await this.notificationService.sendNotification(token, receiverId, title, message);
      return { message: 'Notification envoyée avec succès' };
    } catch (err: any) {
      // Propager l'erreur avec un message par défaut si nécessaire
      throw new BadRequestException(err.message || 'Erreur lors de l\'envoi de la notification');
    }
  }
}


import { EmailService } from "../../application/services/EmailService";

export class FakeEmailService implements EmailService {
  async sendConfirmationEmail(email: string, clientId: string): Promise<void> {
    console.log(`Email envoyé à ${email} avec le lien : https://avenirbank.com/confirm/${clientId}`);
  }
}

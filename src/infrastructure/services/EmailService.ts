// infrastructure/email/RealEmailService.ts
import nodemailer from "nodemailer";
import { EmailService } from "../../application/services/EmailService";

export class RealEmailService implements EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const confirmationUrl = `${process.env.APP_BASE_URL}/clients/confirm/${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Bienvenue sur Banque AVENIR !</h2>
        <p>Merci de vous être inscrit. Pour confirmer votre compte, cliquez sur le bouton ci-dessous :</p>
        <a href="${confirmationUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 10px;">
           Confirmer mon compte
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
          Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"Banque AVENIR" <${process.env.SMTP_USER}>`,
        to,
        subject: "Confirmez votre inscription à Banque AVENIR",
        html: htmlContent,
      });

    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email :", err);
      throw err;
    }
  }
}

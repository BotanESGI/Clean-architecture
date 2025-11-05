import nodemailer from "nodemailer";
import { EmailService } from "../../application/services/EmailService";

export class RealEmailService implements EmailService {
  private transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 1025;
    const secure = String(process.env.SMTP_SECURE).toLowerCase() === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host) {
      const opts: any = {
        host,
        port,
        secure,
      };
      if (user && pass) {
        opts.auth = { user, pass };
      } else {
        opts.ignoreTLS = !secure;
      }
      this.transporter = nodemailer.createTransport(opts);
      console.log(`[EmailService] SMTP connecté à ${host}:${port} (secure=${secure})`);
    } else {
      this.transporter = null as any;
      console.warn("[EmailService] SMTP_HOST manquant. Emails non envoyés.");
    }
  }

  async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const confirmationUrl = `${frontendBase}/confirm/${token}`;
    const from = process.env.SMTP_FROM || "no-reply@example.local";

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

    console.log("\n" + "=".repeat(80));
    console.log("🔗 LIEN DE CONFIRMATION (copiez ce lien dans votre navigateur)");
    console.log("=".repeat(80));
    console.log(`Email: ${to}`);
    console.log(`Lien: ${confirmationUrl}`);
    console.log("=".repeat(80) + "\n");

    if (!this.transporter) {
      console.warn("[EmailService] SMTP non configuré - email non envoyé");
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Banque AVENIR" <${from}>`,
        to,
        subject: "Confirmez votre inscription à Banque AVENIR",
        html: htmlContent,
      });
      console.log(`Email de confirmation envoyé à ${to}`);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email :", err);
    }
  }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealEmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class RealEmailService {
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT) || 1025;
        const secure = String(process.env.SMTP_SECURE).toLowerCase() === "true";
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (host) {
            const opts = {
                host,
                port,
                secure,
            };
            if (user && pass) {
                opts.auth = { user, pass };
            }
            else {
                opts.ignoreTLS = !secure;
            }
            this.transporter = nodemailer_1.default.createTransport(opts);
            console.log(`[EmailService] SMTP connecté à ${host}:${port} (secure=${secure})`);
        }
        else {
            this.transporter = null;
            console.warn("[EmailService] SMTP_HOST manquant. Emails non envoyés.");
        }
    }
    async sendConfirmationEmail(to, token) {
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
        }
        catch (err) {
            console.error("Erreur lors de l'envoi de l'email :", err);
        }
    }
    async sendSavingsRateChangeNotification(to, rate) {
        const from = process.env.SMTP_FROM || "no-reply@example.local";
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Modification du taux d'épargne</h2>
        <p>Bonjour,</p>
        <p>Nous vous informons que le taux d'épargne de votre compte d'épargne a été modifié.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #27ae60;">
            Nouveau taux d'épargne : ${rate.toFixed(2)}%
          </p>
        </div>
        <p>Ce nouveau taux s'appliquera dès aujourd'hui pour le calcul des intérêts quotidiens.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
          Cordialement,<br>
          L'équipe Banque AVENIR
        </p>
      </div>
    `;
        console.log(`\n📧 Notification de changement de taux d'épargne envoyée à ${to} (${rate}%)`);
        if (!this.transporter) {
            console.warn("[EmailService] SMTP non configuré - email non envoyé");
            return;
        }
        try {
            await this.transporter.sendMail({
                from: `"Banque AVENIR" <${from}>`,
                to,
                subject: "Modification du taux d'épargne - Banque AVENIR",
                html: htmlContent,
            });
            console.log(`Email de notification envoyé à ${to}`);
        }
        catch (err) {
            console.error("Erreur lors de l'envoi de l'email :", err);
        }
    }
}
exports.RealEmailService = RealEmailService;

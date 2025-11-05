"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealEmailService = void 0;
// infrastructure/email/RealEmailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
class RealEmailService {
    constructor() {
        const host = process.env.SMTP_HOST;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (host && user && pass) {
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port: Number(process.env.SMTP_PORT) || 587,
                auth: { user, pass },
            });
        }
        else {
            // Fallback: disable real sending in dev if credentials are missing
            this.transporter = null;
            console.warn("[EmailService] SMTP credentials missing. Emails will not be sent.");
        }
    }
    async sendConfirmationEmail(to, token) {
        // Send users to the frontend route /confirm/[token]
        const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3001";
        const confirmationUrl = `${frontendBase}/confirm/${token}`;
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
        // Toujours afficher le lien dans la console pour faciliter les tests
        console.log("\n" + "=".repeat(80));
        console.log("🔗 LIEN DE CONFIRMATION (copiez ce lien dans votre navigateur)");
        console.log("=".repeat(80));
        console.log(`Email: ${to}`);
        console.log(`Lien: ${confirmationUrl}`);
        console.log("=".repeat(80) + "\n");
        if (!this.transporter) {
            // Dev mode without SMTP: ne pas envoyer d'email réel
            console.warn("[EmailService] SMTP non configuré - email non envoyé");
            return;
        }
        try {
            await this.transporter.sendMail({
                from: `"Banque AVENIR" <${process.env.SMTP_USER}>`,
                to,
                subject: "Confirmez votre inscription à Banque AVENIR",
                html: htmlContent,
            });
            console.log(`✅ Email de confirmation envoyé à ${to}`);
        }
        catch (err) {
            console.error("❌ Erreur lors de l'envoi de l'email :", err);
        }
    }
}
exports.RealEmailService = RealEmailService;

// Exemple de comment utiliser Result dans un contrôleur HTTP

import { Request, Response } from "express";
import { RegisterClient } from "../../application/use-cases/RegisterClient.refactored";

export class RegisterClientController {
  constructor(private readonly registerClient: RegisterClient) {}

  async handle(req: Request, res: Response): Promise<void> {
    const { firstName, lastName, email, password } = req.body;

    const result = await this.registerClient.execute(
      firstName,
      lastName,
      email,
      password
    );

    // Si erreur, on retourne le code HTTP approprié
    if (result.isFailure) {
      res.status(400).json({
        success: false,
        error: result.error.message,
      });
      return;
    }

    // Sinon on retourne le client créé
    const client = result.value;
    res.status(201).json({
      success: true,
      data: {
        id: client.getId(),
        email: client.getEmail(),
        firstName: client.getFirstName(),
        lastName: client.getLastName(),
      },
    });
  }
}

// Alternative en fonction simple
export async function handleRegisterClient(
  req: Request,
  res: Response,
  registerClient: RegisterClient
): Promise<void> {
  const { firstName, lastName, email, password } = req.body;

  const result = await registerClient.execute(firstName, lastName, email, password);

  if (result.isFailure) {
    const statusCode = getStatusCodeFromError(result.error);
    res.status(statusCode).json({
      success: false,
      error: result.error.message,
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: result.value,
  });
}

// Détermine le bon code HTTP selon le type d'erreur
function getStatusCodeFromError(error: Error): number {
  if (error.name === "PasswordValidationError") return 400;
  if (error.name === "RegisterClientError") {
    if (error.message.includes("déjà utilisé")) return 409; // Conflict
    return 400;
  }
  return 500;
}


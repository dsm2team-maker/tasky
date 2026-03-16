import crypto from "crypto";

// Générer un token sécurisé
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

// Générer un token de vérification email
export const generateVerificationToken = () => {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return { token, expiresAt };
};

// Générer un token de reset password
export const generateResetToken = () => {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
  return { token, expiresAt };
};

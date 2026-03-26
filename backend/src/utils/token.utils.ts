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

// Générer un OTP 6 chiffres (changement téléphone, changement email, recovery)
// Expire dans 10 minutes
export const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString(); // 6 chiffres
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  return { otp, expiresAt };
};

// Générer un token de confirmation changement email (lien cliquable)
// Expire dans 1h
export const generateEmailChangeToken = () => {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
  return { token, expiresAt };
};

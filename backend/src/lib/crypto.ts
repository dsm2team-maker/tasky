import crypto from "crypto";
import env from "../config/env.config";

// ─── Chiffrement au repos (AES-256-GCM) ──────────────────────────────────────
// Utilisé pour les données bancaires sensibles (IBAN, BIC, nom de banque)
// avant écriture en base. La clé ne doit JAMAIS être committée — elle vit
// uniquement dans les variables d'environnement (Railway en prod).

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommandé pour GCM
const PREFIX = "v1:";

let cachedKey: Buffer | null = null;

const getKey = (): Buffer => {
  if (cachedKey) return cachedKey;

  const raw = env.encryptionKey;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY manquante — générer avec: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY invalide — attendu 32 octets encodés en hex (64 caractères)");
  }

  cachedKey = key;
  return key;
};

export const encrypt = (plainText: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (value: string): string => {
  if (!value.startsWith(PREFIX)) {
    // Valeur déjà en clair (donnée antérieure au chiffrement, non migrée)
    return value;
  }

  const [ivHex, authTagHex, dataHex] = value.slice(PREFIX.length).split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Format de donnée chiffrée invalide");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

export const encryptNullable = (value: string | null | undefined): string | null | undefined => {
  if (value === null || value === undefined) return value;
  return encrypt(value);
};

export const decryptNullable = (value: string | null | undefined): string | null | undefined => {
  if (value === null || value === undefined) return value;
  return decrypt(value);
};

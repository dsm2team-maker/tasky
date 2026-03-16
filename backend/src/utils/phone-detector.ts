// Détecte les numéros de téléphone dans les messages
const PHONE_PATTERNS = [
  /(\+33|0033|0)[1-9](\s?\d{2}){4}/g,          // Format français
  /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, // Format international
  /\b\d{2}[\s.-]\d{2}[\s.-]\d{2}[\s.-]\d{2}[\s.-]\d{2}\b/g,  // XX XX XX XX XX
];

// Détecte les emails dans les messages
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export const containsPhoneNumber = (text: string): boolean => {
  return PHONE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0; // Reset regex
    return pattern.test(text);
  });
};

export const containsEmail = (text: string): boolean => {
  EMAIL_PATTERN.lastIndex = 0;
  return EMAIL_PATTERN.test(text);
};

export const containsPersonalInfo = (text: string): boolean => {
  return containsPhoneNumber(text) || containsEmail(text);
};

export const sanitizeMessage = (text: string): string => {
  let sanitized = text;
  PHONE_PATTERNS.forEach((pattern) => {
    pattern.lastIndex = 0;
    sanitized = sanitized.replace(pattern, "[numéro masqué]");
  });
  EMAIL_PATTERN.lastIndex = 0;
  sanitized = sanitized.replace(EMAIL_PATTERN, "[email masqué]");
  return sanitized;
};

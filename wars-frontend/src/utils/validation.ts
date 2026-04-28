import { isValidNumber, parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

/**
 * Validates international phone numbers using libphonenumber-js
 * @param phone The phone number string
 * @param countryCode The ISO country code (e.g., 'RW', 'US')
 */
export function validatePhone(phone: string, countryCode: string): boolean {
  try {
    // If we only have a numeric code like +250, we need to map it or use the ISO code
    // The CountrySelector now provides ISO codes as 'id'
    return isValidNumber(phone, countryCode as CountryCode);
  } catch (error) {
    return false;
  }
}

/**
 * Validates email addresses using a standard robust regex
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Password Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character (@$!%*?&#)
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one digit." };
  }
  if (!/[@$!%*?&#]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character (@$!%*?&#)." };
  }
  return { isValid: true };
}

/**
 * Returns the typical maximum length for a phone number in a given country
 */
export function getMaxLengthForCountry(isoCode: string): number {
  switch (isoCode.toUpperCase()) {
    case 'RW': return 9;
    case 'US': case 'CA': return 10;
    case 'GB': return 10;
    case 'FR': case 'DE': return 10;
    case 'KE': case 'UG': case 'TZ': return 9;
    default: return 15; // Universal fallback
  }
}

/**
 * Formats a phone number for display if possible
 */
export function formatPhone(phone: string, countryCode: string): string {
  const phoneNumber = parsePhoneNumberFromString(phone, countryCode as CountryCode);
  return phoneNumber ? phoneNumber.formatInternational() : phone;
}

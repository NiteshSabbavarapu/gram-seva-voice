// Helper to get clean Indian phone number
export const getIndianPhoneNumber = (rawInput: string): string => {
  let cleaned = rawInput.replace(/\D/g, ""); // Remove non-digits
  // Remove leading 91 if present (for pasted numbers)
  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  // Remove any leading zeros
  cleaned = cleaned.replace(/^0+/, "");
  // Only keep the last 10 digits if too long
  if (cleaned.length > 10) cleaned = cleaned.slice(-10);
  return cleaned;
};

// Validate Indian mobile number
export const isValidIndianMobile = (phoneNumber: string): boolean => {
  const cleaned = getIndianPhoneNumber(phoneNumber);
  // Indian mobile numbers start with 6, 7, 8, or 9
  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
};

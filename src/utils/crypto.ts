const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion

export function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateInviteCode(): string {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  const code = Array.from(array, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
  return `SANTA-${code}`;
}

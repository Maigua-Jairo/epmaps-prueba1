export type PasswordStrength = 'débil' | 'media' | 'fuerte';

export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  const characterGroups = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length >= 12 && characterGroups >= 3) return 'fuerte';
  if (password.length >= 8 && characterGroups >= 2) return 'media';
  return 'débil';
}

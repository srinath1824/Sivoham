// Sanitization utilities for frontend

export const sanitizeText = (input: string | null | undefined): string => {
  if (!input) return '';
  return String(input).replace(/[<>\"'&]/g, '').trim();
};

export const sanitizeHTML = (input: string | null | undefined): string => {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMobile = (mobile: string): boolean => {
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile);
};


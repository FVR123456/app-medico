/**
 * Validation utilities for form inputs
 */

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El email es requerido';
  if (!emailRegex.test(email)) return 'Email inválido';
  if (email.length > 255) return 'El email es muy largo';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (password.length > 128) return 'La contraseña es muy larga';
  return null;
};

export const validateName = (name: string, fieldName: string = 'Nombre'): string | null => {
  if (!name) return `${fieldName} es requerido`;
  if (name.trim().length < 2) return `${fieldName} debe tener al menos 2 caracteres`;
  if (name.length > 100) return `${fieldName} es muy largo`;
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'El teléfono es requerido';
  const phoneRegex = /^[0-9\s\-()+]+$/;
  if (!phoneRegex.test(phone)) return 'Teléfono inválido';
  if (phone.length < 7 || phone.length > 20) return 'Teléfono inválido';
  return null;
};

export const validateLoginForm = (email: string, password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });

  return errors;
};

export const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
  name: string,
  role: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });

  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' });
  }

  const nameError = validateName(name);
  if (nameError) errors.push({ field: 'name', message: nameError });

  if (!role || !['doctor', 'patient'].includes(role)) {
    errors.push({ field: 'role', message: 'Selecciona un rol válido' });
  }

  return errors;
};

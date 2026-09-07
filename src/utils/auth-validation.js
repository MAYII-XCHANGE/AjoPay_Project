export function validateLogin({ email, password }) {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function validateRegistration({ name, email, password }) {
  const errors = validateLogin({ email, password });
  const names = name.trim().split(/\s+/);
  if (names.length < 2) errors.name = "Enter your first and last name.";
  if (password.length < 8) errors.password = "Use at least 8 characters for your password.";
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

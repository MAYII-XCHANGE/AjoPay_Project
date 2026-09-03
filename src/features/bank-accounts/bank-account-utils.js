export const maskAccountNumber = (accountNumber = "") =>
  `•••• ${accountNumber.slice(-4)}`;

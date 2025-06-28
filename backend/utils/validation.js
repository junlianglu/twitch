// utils/validation.js

/**
 * Checks if a string is non-empty and not just whitespace.
 * @param {string} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates an email string format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
}

/**
 * Validates if the password meets minimum length and optional complexity.
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
  // Example: at least 8 characters, at least one number and one letter
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return typeof password === 'string' && passwordRegex.test(password);
}

/**
 * Validates that all required fields are present in the data object.
 * @param {Object} data - The request body or input object
 * @param {string[]} requiredFields - List of required field keys
 * @returns {string[]} - Array of missing field names
 */
function getMissingFields(data, requiredFields) {
  return requiredFields.filter((field) => !isNonEmptyString(data[field]));
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  getMissingFields,
};
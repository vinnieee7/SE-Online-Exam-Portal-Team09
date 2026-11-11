// Logs an unexpected error on the server and returns a client-safe body without internal details
// (OWASP ZAP "Information Disclosure - Debug Error Messages", v1.0.1)
function serverError(err, message) {
  console.error(`${message}:`, err);
  return { error: message };
}

module.exports = { serverError };

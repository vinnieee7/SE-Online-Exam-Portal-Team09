const fs = require('fs');
const https = require('https');

// OEP-SR-001: encrypted transport. The API refuses any client that cannot negotiate TLS 1.2 or newer.
const TLS_OPTIONS = Object.freeze({ minVersion: 'TLSv1.2' });

// Wraps the Express app in an HTTPS server that enforces TLS_OPTIONS
function createSecureServer(app, { key, cert }) {
  return https.createServer({ key, cert, ...TLS_OPTIONS }, app);
}

function loadCertificates(keyPath, certPath) {
  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
}

module.exports = { TLS_OPTIONS, createSecureServer, loadCertificates };

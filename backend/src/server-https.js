const path = require('path');
const app = require('./app');
const { createSecureServer, loadCertificates } = require('./secureServer');

// HTTPS entry point (OEP-SR-001). Plain `npm start` stays HTTP for local development and the demo.
const PORT = process.env.HTTPS_PORT || 5443;
const keyPath = process.env.TLS_KEY_PATH || path.resolve(__dirname, '../certs/dev-key.pem');
const certPath = process.env.TLS_CERT_PATH || path.resolve(__dirname, '../certs/dev-cert.pem');

let credentials;
try {
  credentials = loadCertificates(keyPath, certPath);
} catch (err) {
  console.error(`TLS certificate or key not found (${err.message}).`);
  console.error('Run "npm run cert:dev" to create a self-signed development certificate, or set TLS_KEY_PATH and TLS_CERT_PATH.');
  process.exit(1);
}

createSecureServer(app, credentials).listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🔒 Online Exam Portal (OEP) API Server Running over HTTPS (TLS 1.2+)`);
  console.log(`📡 URL: https://localhost:${PORT}`);
  console.log(`📚 Health Check: https://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

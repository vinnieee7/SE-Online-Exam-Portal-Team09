// Creates a self-signed certificate for running the API over HTTPS on localhost (development only).
// Output: backend/certs/dev-key.pem and backend/certs/dev-cert.pem (git-ignored).
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

(async () => {
  const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    keySize: 2048,
    algorithm: 'sha256'
  });

  const dir = path.resolve(__dirname, '../certs');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'dev-key.pem'), pems.private);
  fs.writeFileSync(path.join(dir, 'dev-cert.pem'), pems.cert);

  console.log('Wrote certs/dev-key.pem and certs/dev-cert.pem (self-signed, localhost, development only).');
})().catch((err) => {
  console.error('Certificate generation failed:', err.message);
  process.exit(1);
});

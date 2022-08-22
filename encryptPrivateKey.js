const fs = require("fs");
const crypto = require("crypto");

function encryptPrivateKey (privateKey) {
  return crypto.publicEncrypt({
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  // We convert the data string to a buffer
  Buffer.from(privateKey)
  );
}

module.exports = {
    encryptPrivateKey,
}

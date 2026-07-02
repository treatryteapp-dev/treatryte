const fs = require('fs');
const path = require('path');
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');
const env = require('./config/env');

let cachedPrivateKey = null;

function getPrivateKey() {
  if (!cachedPrivateKey) {
    const keyPath = path.resolve(process.cwd(), env.aws.cloudfrontPrivateKeyPath);
    cachedPrivateKey = fs.readFileSync(keyPath, 'utf8');
  }
  return cachedPrivateKey;
}

/**
 * Generates a short-TTL signed CloudFront URL for a private S3 object. The
 * distribution's default cache behavior requires signed URLs (trusted key
 * group), so any unsigned request to a vault file URL is rejected by
 * CloudFront itself.
 */
function signVaultUrl(s3Key, { ttlSeconds = 300 } = {}) {
  const url = `https://${env.aws.cloudfrontDomain}/${s3Key}`;
  const dateLessThan = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  return getSignedUrl({
    url,
    keyPairId: env.aws.cloudfrontKeyPairId,
    privateKey: getPrivateKey(),
    dateLessThan,
  });
}

module.exports = { signVaultUrl };

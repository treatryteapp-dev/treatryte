const fs = require('fs');
const path = require('path');
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');
const env = require('./config/env');

let cachedPrivateKey = null;

function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey;

  if (env.aws.cloudfrontPrivateKeyBase64) {
    cachedPrivateKey = Buffer.from(env.aws.cloudfrontPrivateKeyBase64, 'base64').toString('utf8');
    return cachedPrivateKey;
  }

  if (env.aws.cloudfrontPrivateKeyPath) {
    const keyPath = path.resolve(process.cwd(), env.aws.cloudfrontPrivateKeyPath);
    cachedPrivateKey = fs.readFileSync(keyPath, 'utf8');
    return cachedPrivateKey;
  }

  throw new Error(
    'No CloudFront private key configured - set CLOUDFRONT_PRIVATE_KEY_B64 (production) or CLOUDFRONT_PRIVATE_KEY_PATH (local dev)',
  );
}

/**
 * Generates a short-TTL signed CloudFront URL for a private S3 object. The
 * distribution's default cache behavior requires signed URLs (trusted key
 * group), so any unsigned request to a vault file URL is rejected by
 * CloudFront itself.
 */
function signVaultUrl(s3Key, { ttlSeconds = 300 } = {}) {
  try {
    const url = `https://${env.aws.cloudfrontDomain}/${s3Key}`;
    const dateLessThan = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    return getSignedUrl({
      url,
      keyPairId: env.aws.cloudfrontKeyPairId,
      privateKey: getPrivateKey(),
      dateLessThan,
    });
  } catch (err) {
    console.error('Failed to sign CloudFront URL:', err.message);
    return null;
  }
}

module.exports = { signVaultUrl };

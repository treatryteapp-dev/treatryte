require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const nombaEnv = process.env.NOMBA_ENV === 'live' ? 'live' : 'sandbox';

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,

  vaultQuotaBytes: Number(process.env.VAULT_QUOTA_BYTES) || 8_589_934_592,

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
    cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN,
    cloudfrontKeyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    // On a host like Railway there's no local keys/ directory (it's
    // git-ignored, never deployed), so the key is passed as a base64-encoded
    // env var instead. CLOUDFRONT_PRIVATE_KEY_PATH remains as a local-dev
    // fallback for reading the .pem file directly off disk.
    cloudfrontPrivateKeyBase64: process.env.CLOUDFRONT_PRIVATE_KEY_B64,
    cloudfrontPrivateKeyPath: process.env.CLOUDFRONT_PRIVATE_KEY_PATH,
  },

  nomba: {
    env: nombaEnv,
    baseUrl: nombaEnv === 'live' ? 'https://api.nomba.com' : 'https://sandbox.nomba.com',
    accountId: process.env.NOMBA_ACCOUNT_ID,
    subAccountId: process.env.NOMBA_SUB_ACCOUNT_ID,
    clientId: nombaEnv === 'live' ? process.env.NOMBA_LIVE_CLIENT_ID : process.env.NOMBA_TEST_CLIENT_ID,
    clientSecret:
      nombaEnv === 'live' ? process.env.NOMBA_LIVE_CLIENT_SECRET : process.env.NOMBA_TEST_CLIENT_SECRET,
    webhookSecret: process.env.NOMBA_WEBHOOK_SECRET,
  },

  required,
};

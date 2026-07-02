require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  CreatePublicKeyCommand,
  CreateKeyGroupCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
} = require('@aws-sdk/client-cloudfront');
const { getCloudFrontClient } = require('./aws');

const SUMMARY_FILE = path.join(__dirname, '..', 'cloudfront.json');
const PUBLIC_KEY_PATH = path.join(__dirname, '..', 'keys', 'cloudfront_public_key.pem');

async function main() {
  const cloudfront = getCloudFrontClient();
  const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));
  const publicKeyPem = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');

  console.log('Registering public key with CloudFront...');
  const publicKey = await cloudfront.send(
    new CreatePublicKeyCommand({
      PublicKeyConfig: {
        Name: `treatryte-vault-key-${Date.now()}`,
        CallerReference: `treatryte-vault-key-${Date.now()}`,
        EncodedKey: publicKeyPem,
        Comment: 'TreatRyte medical vault signed URL key',
      },
    }),
  );
  const publicKeyId = publicKey.PublicKey.Id;
  console.log('Public key registered:', publicKeyId);

  console.log('Creating key group...');
  const keyGroup = await cloudfront.send(
    new CreateKeyGroupCommand({
      KeyGroupConfig: {
        Name: `treatryte-vault-key-group-${Date.now()}`,
        Items: [publicKeyId],
        Comment: 'TreatRyte medical vault signed URL key group',
      },
    }),
  );
  const keyGroupId = keyGroup.KeyGroup.Id;
  console.log('Key group created:', keyGroupId);

  console.log('Fetching current distribution config...');
  const { DistributionConfig, ETag } = await cloudfront.send(
    new GetDistributionConfigCommand({ Id: summary.distributionId }),
  );

  DistributionConfig.DefaultCacheBehavior.TrustedKeyGroups = {
    Enabled: true,
    Quantity: 1,
    Items: [keyGroupId],
  };

  console.log('Updating distribution to require signed URLs...');
  const updated = await cloudfront.send(
    new UpdateDistributionCommand({
      Id: summary.distributionId,
      IfMatch: ETag,
      DistributionConfig,
    }),
  );

  const newSummary = {
    ...summary,
    publicKeyId,
    keyGroupId,
    status: updated.Distribution.Status,
  };
  fs.writeFileSync(SUMMARY_FILE, JSON.stringify(newSummary, null, 2));

  console.log('\nCloudFront now requires signed URLs for all requests.');
  console.log('Public Key ID (use as CLOUDFRONT_KEY_PAIR_ID):', publicKeyId);
  console.log('Status:', updated.Distribution.Status, '(propagation takes 5-15 minutes)');
}

main().catch((error) => {
  console.error('CloudFront signing setup failed:', error.message);
  process.exit(1);
});

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GetDistributionCommand } = require('@aws-sdk/client-cloudfront');
const { getCloudFrontClient } = require('./aws');
const { signVaultUrl } = require('./cloudfrontSign');

const SUMMARY_FILE = path.join(__dirname, '..', 'cloudfront.json');
const { distributionId, domainName } = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));

const POLL_INTERVAL_MS = 30_000;
const MAX_WAIT_MS = 20 * 60_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const s3Key = process.argv[2];
  if (!s3Key) {
    console.error('Usage: node waitAndVerifySignedUrls.js <s3Key>');
    process.exit(1);
  }

  const cloudfront = getCloudFrontClient();
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    const { Distribution } = await cloudfront.send(new GetDistributionCommand({ Id: distributionId }));
    console.log(`Distribution status: ${Distribution.Status}`);
    if (Distribution.Status === 'Deployed') break;
    await sleep(POLL_INTERVAL_MS);
  }

  const unsignedUrl = `https://${domainName}/${s3Key}`;
  const unsignedRes = await fetch(unsignedUrl);
  console.log('Unsigned request status (expect 403):', unsignedRes.status);

  const signedUrl = signVaultUrl(s3Key);
  const signedRes = await fetch(signedUrl);
  const body = await signedRes.text();
  console.log('Signed request status (expect 200):', signedRes.status);
  console.log('Signed request body:', body);

  if (unsignedRes.status === 403 && signedRes.status === 200) {
    console.log('\nSigned URL enforcement verified successfully.');
  } else {
    console.error('\nVerification FAILED - check distribution config.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const { GetDistributionCommand } = require('@aws-sdk/client-cloudfront');
const { getCloudFrontClient } = require('./aws');

const SUMMARY_FILE = path.join(__dirname, '..', 'cloudfront.json');
const { distributionId, domainName } = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));

const POLL_INTERVAL_MS = 30_000;
const MAX_WAIT_MS = 20 * 60_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchStatus(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

async function main() {
  const cloudfront = getCloudFrontClient();
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    const { Distribution } = await cloudfront.send(
      new GetDistributionCommand({ Id: distributionId }),
    );
    console.log(`Distribution status: ${Distribution.Status}`);
    if (Distribution.Status === 'Deployed') {
      break;
    }
    await sleep(POLL_INTERVAL_MS);
  }

  const url = `https://${domainName}/health-check/ping.txt`;
  console.log('Fetching', url);
  const { statusCode, body } = await fetchStatus(url);

  if (statusCode === 200) {
    console.log('CloudFront is serving the S3 object successfully.');
    console.log('Response body:', body);
  } else {
    console.error(`CloudFront returned status ${statusCode}`);
    console.error(body);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});

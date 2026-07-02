require('dotenv').config();
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getS3Client } = require('./aws');

const BUCKET = process.env.AWS_S3_BUCKET;
const KEY = 'health-check/ping.txt';

async function main() {
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: `treatryte s3+cloudfront check - ${new Date().toISOString()}`,
      ContentType: 'text/plain',
    }),
  );
  console.log(`Uploaded s3://${BUCKET}/${KEY}`);
}

main().catch((error) => {
  console.error('Upload failed:', error.message);
  process.exit(1);
});

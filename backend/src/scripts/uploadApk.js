require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getS3Client } = require('../aws');
const env = require('../config/env');

// Uploads a built APK to a fixed S3 key so the public download route
// (GET /api/downloads/app-latest.apk) always serves whatever was uploaded
// most recently, with no link to update on our end. Re-run this after every
// new release build:
//   node src/scripts/uploadApk.js /path/to/app-release.apk
const APK_KEY = 'releases/treatryte-latest.apk';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node src/scripts/uploadApk.js /path/to/app-release.apk');
    process.exitCode = 1;
    return;
  }
  const resolved = path.resolve(filePath);
  const body = fs.readFileSync(resolved);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.aws.s3Bucket,
      Key: APK_KEY,
      Body: body,
      ContentType: 'application/vnd.android.package-archive',
      ContentDisposition: 'attachment; filename="TreatRyte.apk"',
    })
  );

  console.log(`Uploaded ${resolved} (${(body.length / 1024 / 1024).toFixed(1)} MB) to s3://${env.aws.s3Bucket}/${APK_KEY}`);
}

main().catch((error) => {
  console.error('APK upload failed:', error.message);
  process.exitCode = 1;
});

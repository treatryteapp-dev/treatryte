require('dotenv').config();
const {
  CreateBucketCommand,
  HeadBucketCommand,
  PutPublicAccessBlockCommand,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand,
} = require('@aws-sdk/client-s3');
const { getS3Client } = require('./aws');

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';

async function main() {
  const s3 = getS3Client();

  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log(`Bucket "${BUCKET}" already exists, skipping creation.`);
  } catch {
    console.log(`Creating bucket "${BUCKET}" in ${REGION}...`);
    await s3.send(
      new CreateBucketCommand({
        Bucket: BUCKET,
        // us-east-1 must omit CreateBucketConfiguration entirely.
        ...(REGION === 'us-east-1'
          ? {}
          : { CreateBucketConfiguration: { LocationConstraint: REGION } }),
      }),
    );
    console.log('Bucket created.');
  }

  console.log('Blocking all public access...');
  await s3.send(
    new PutPublicAccessBlockCommand({
      Bucket: BUCKET,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    }),
  );

  console.log('Enabling default server-side encryption (SSE-S3)...');
  await s3.send(
    new PutBucketEncryptionCommand({
      Bucket: BUCKET,
      ServerSideEncryptionConfiguration: {
        Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }],
      },
    }),
  );

  console.log('Enabling versioning (protects medical documents from accidental overwrite)...');
  await s3.send(
    new PutBucketVersioningCommand({
      Bucket: BUCKET,
      VersioningConfiguration: { Status: 'Enabled' },
    }),
  );

  console.log(`\nS3 bucket "${BUCKET}" is ready: private, encrypted, versioned.`);
}

main().catch((error) => {
  console.error('S3 provisioning failed:', error.message);
  process.exit(1);
});

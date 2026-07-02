const { S3Client } = require('@aws-sdk/client-s3');
const { CloudFrontClient } = require('@aws-sdk/client-cloudfront');
const { STSClient } = require('@aws-sdk/client-sts');

function credentials() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: credentials(),
  });
}

function getCloudFrontClient() {
  // CloudFront is a global service managed via the us-east-1 endpoint.
  return new CloudFrontClient({
    region: 'us-east-1',
    credentials: credentials(),
  });
}

function getStsClient() {
  return new STSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: credentials(),
  });
}

module.exports = { getS3Client, getCloudFrontClient, getStsClient };

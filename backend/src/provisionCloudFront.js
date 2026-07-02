require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  CreateOriginAccessControlCommand,
  CreateDistributionCommand,
} = require('@aws-sdk/client-cloudfront');
const { PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const { getCloudFrontClient, getS3Client } = require('./aws');

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';
const OUTPUT_FILE = path.join(__dirname, '..', 'cloudfront.json');

// CloudFront's AWS-managed "CachingOptimized" policy id (same across all accounts).
const CACHING_OPTIMIZED_POLICY_ID = '658327ea-f89d-4fab-a63d-7e88639e58f6';

async function main() {
  const cloudfront = getCloudFrontClient();
  const s3 = getS3Client();

  const bucketDomain = `${BUCKET}.s3.${REGION}.amazonaws.com`;

  console.log('Creating Origin Access Control...');
  const oac = await cloudfront.send(
    new CreateOriginAccessControlCommand({
      OriginAccessControlConfig: {
        Name: `${BUCKET}-oac`,
        OriginAccessControlOriginType: 's3',
        SigningBehavior: 'always',
        SigningProtocol: 'sigv4',
      },
    }),
  );
  const oacId = oac.OriginAccessControl.Id;
  console.log('OAC created:', oacId);

  console.log('Creating CloudFront distribution...');
  const distribution = await cloudfront.send(
    new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: `treatryte-medical-vault-${Date.now()}`,
        Comment: 'TreatRyte Medical Vault CDN',
        Enabled: true,
        DefaultRootObject: '',
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: 's3-origin',
              DomainName: bucketDomain,
              OriginAccessControlId: oacId,
              S3OriginConfig: { OriginAccessIdentity: '' },
            },
          ],
        },
        DefaultCacheBehavior: {
          TargetOriginId: 's3-origin',
          ViewerProtocolPolicy: 'redirect-to-https',
          CachePolicyId: CACHING_OPTIMIZED_POLICY_ID,
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] },
          },
        },
      },
    }),
  );

  const dist = distribution.Distribution;
  console.log('Distribution created:', dist.Id, '-', dist.DomainName);

  console.log('Updating S3 bucket policy to allow only this CloudFront distribution...');
  const bucketPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowCloudFrontServicePrincipal',
        Effect: 'Allow',
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${BUCKET}/*`,
        Condition: {
          StringEquals: { 'AWS:SourceArn': dist.ARN },
        },
      },
    ],
  };
  await s3.send(
    new PutBucketPolicyCommand({
      Bucket: BUCKET,
      Policy: JSON.stringify(bucketPolicy),
    }),
  );

  const summary = {
    distributionId: dist.Id,
    distributionArn: dist.ARN,
    domainName: dist.DomainName,
    status: dist.Status,
    originAccessControlId: oacId,
    bucket: BUCKET,
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2));

  console.log('\nCloudFront distribution provisioning started.');
  console.log('Domain:', dist.DomainName);
  console.log('Status:', dist.Status, '(deployment usually takes 5-15 minutes)');
  console.log('Details saved to', OUTPUT_FILE);
}

main().catch((error) => {
  console.error('CloudFront provisioning failed:', error.message);
  process.exit(1);
});

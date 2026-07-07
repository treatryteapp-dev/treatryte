const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const { getS3Client } = require('../aws');
const env = require('../config/env');
const { asyncHandler } = require('../middleware/asyncHandler');

// Same fixed key uploadApk.js uploads to - whatever object lives here right
// now is what this route serves, so the public URL never has to change.
const APK_KEY = 'releases/treatryte-latest.apk';
const PRESIGN_TTL_SECONDS = 300;

// Public, no auth - this is the whole point (a link anyone can hand out).
// Redirects to a freshly-signed S3 URL each time rather than proxying the
// ~50MB file through this server, so the *constant* link never expires even
// though each individual signed URL only lives 5 minutes.
const latestApk = asyncHandler(async (req, res) => {
  const url = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({ Bucket: env.aws.s3Bucket, Key: APK_KEY }),
    { expiresIn: PRESIGN_TTL_SECONDS }
  );
  res.redirect(302, url);
});

module.exports = { latestApk };

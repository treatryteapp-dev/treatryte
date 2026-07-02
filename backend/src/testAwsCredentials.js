require('dotenv').config();
const { GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { getStsClient } = require('./aws');

async function main() {
  const sts = getStsClient();
  const identity = await sts.send(new GetCallerIdentityCommand({}));
  console.log('AWS credentials valid.');
  console.log('Account:', identity.Account);
  console.log('ARN:', identity.Arn);
}

main().catch((error) => {
  console.error('AWS credential check failed:', error.message);
  process.exit(1);
});

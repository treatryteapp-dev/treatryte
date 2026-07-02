const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`TreatRyte API listening on port ${env.port} (${env.nodeEnv})`);
});

module.exports = async function globalTeardown() {
  await global.__MONGO_REPLSET__?.stop();
};

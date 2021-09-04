const redis = require('async-redis');

const client = redis.createClient();

/**
 *
 * @param {string} key
 * @param {string} data
 * @param {number} ttl second
 *
 */
async function redisWriteData(key, data, ttl = 60) {
  data = JSON.stringify(data, null, 2);
  await client.set(key, data).finally(() => client.EXPIRE(key, ttl));
}

async function redisGetData(key) {
  return JSON.parse(await client.get(key));
}

async function redisDelData(key) {
  await client.del(key, () => {});
}
module.exports = { redisWriteData, redisGetData, redisDelData };

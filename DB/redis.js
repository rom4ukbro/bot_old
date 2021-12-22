const redis = require('async-redis');
const fs = require('fs');
const path = require('path');

const client = redis.createClient();

/**
 *
 * @param {string} key
 * @param {string} data
 * @param {number} ttl second
 *
 */
async function redisWriteData(key, data, ttl = 60) {
  // data.create_at = Date.now() + ttl * 1000;

  // await fs.promises
  //   .mkdir(path.dirname(`../schedule/${key}.json`), { recursive: true })
  //   .then((x) => fs.promises.writeFile(`../schedule/${key}.json`, JSON.stringify(data)))
  //   .finally(() => {
  //     console.log(1);
  //   });

  //redis
  data = JSON.stringify(data, null, 2);
  await client.set(key, data).finally(() => client.EXPIRE(key, ttl));
}

async function redisGetData(key) {
  // var schedule;
  // await fs.readFile(
  //   path.resolve(__dirname, `../schedule/${key}.json`),
  //   'utf8',
  //   function (err, data) {
  //     if (err) return { error: true };
  //     schedule = JSON.parse(data);
  //   },
  // );
  // if (schedule?.create_at < Date.now()) {
  //   await fs.unlink(path.resolve(__dirname, `../schedule/${key}.json`));
  //   return null;
  // }

  // return schedule;

  // redis
  return JSON.parse(await client.get(key));
}

async function redisDelData(key) {
  await client.del(key, () => {});
}

module.exports = { redisWriteData, redisGetData, redisDelData };

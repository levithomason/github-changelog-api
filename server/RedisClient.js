import bluebird from 'bluebird'
import redis from 'redis';
import url from 'url';

import {CACHE_EXPIRY} from './Config'

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisURL = url.parse(process.env.REDISCLOUD_URL)
const client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true})
client.auth(redisURL.auth.split(':')[1])

client.on('error', err => {
  console.log('Error ' + err)
})

export default client

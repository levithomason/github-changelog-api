import bluebird from 'bluebird'
import redis from 'redis';
import url from 'url';

import {REDIS_EXPIRY} from './Config'

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let redisClient;

if (process.env.NODE_ENV === 'production') {
  const redisURL = url.parse(process.env.REDISCLOUD_URL)
  redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true})
  redisClient.auth(redisURL.auth.split(':')[1])
} else {
  redisClient = redis.createClient()
}

redisClient.on('error', err => {
  console.log('Error ' + err)
})

export default redisClient

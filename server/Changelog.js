import Promise from 'bluebird'
import cp from 'child_process'
import fs from 'fs';
import redisClient from './RedisClient'

import {CHANGELOG_DIR, PROJECT_ROOT, CACHE_EXPIRY, S3_BUCKET} from './Config'

Promise.promisifyAll(cp)
Promise.promisifyAll(fs)

function relDir(user, repo) {
  return `${CHANGELOG_DIR}/${user}/${repo}`
}

function absDir(user, repo) {
  return `${PROJECT_ROOT}/${relDir(user, repo)}`
}

const changelog = {
  /**
   * Write CHANGELOG.md to disk, sync to s3, and set in redis
   * @param {string} user The GitHub username
   * @param {string} repo The GitHub repo name
   * @returns {Promise}
   */
  generate(user, repo) {
    const absPath = absDir(user, repo)
    const relPath = relDir(user, repo)
    const ghPath = `${user}/${repo}`

    function _generate() {
      console.log(`...GENERATING CHANGELOG: ${ghPath} in ${relPath}`);
      return cp.execAsync(`mkdir -p ${relPath}`)
        .then(res => cp.execAsync(`github_changelog_generator ${ghPath}`, {cwd: relPath}))
    }

    function _readDisk() {
      const filePath = `${absPath}/CHANGELOG.md`
      console.log(`...READING FROM DISK: ${filePath}`);
      return fs.readFileAsync(`${filePath}`, 'utf8')
    }

    function _setCache(data) {
      console.log(`...SETTING CACHE: ${ghPath}`);
      return redisClient.setAsync(ghPath, data, 'EX', CACHE_EXPIRY)
    }

    function _s3Sync() {
      const flags = `--delete --acl public-read --expires ${CACHE_EXPIRY}`
      const s3Path = `${S3_BUCKET}/${relPath}`
      console.log(`...SYNCING TO S3:\n${absPath}\n${s3Path}`);
      return cp.execAsync(`aws s3 sync ${absPath} s3://${s3Path} ${flags}`)
    }

    return _generate()
      .then(md => _readDisk())
      .then(data => _setCache(data))
      .then(data => _s3Sync())
  },

  /**
   * Read a CHANGELOG from cache, or S3 if not there.
   * @param {string} user The GitHub username
   * @param {string} repo The GitHub repo name
   * @returns {Promise}
   */
  read(user, repo) {
    const relPath = relDir(user, repo)
    const ghPath = `${user}/${repo}`

    function _getCache() {
      console.log(`...READING CACHE: ${ghPath}`);
      return redisClient.getAsync(ghPath)
    }

    function _setCache(data) {
      console.log(`...SETTING CACHE: ${ghPath}`);
      return redisClient.setAsync(ghPath, data, 'EX', CACHE_EXPIRY)
    }

    function _s3Stream() {
      const objectPath = `${relPath}/CHANGELOG.md`
      console.log(`...STREAMING S3: ${objectPath}`);
      return cp.execAsync(`aws s3 cp s3://${S3_BUCKET}/${objectPath} -`)
        .then(data => {
          _setCache(data)
          return data
        })
    }

    return _getCache()
      .then(res => {
        console.log(res ? '...CACHE IS GOOD' : '...CACHE IS BAD')
        return res || _s3Stream()
      })
  },
}

export default changelog

import Promise from 'bluebird'
import cp from 'child_process'
import fs from 'fs'
import marked from 'marked';
import redisClient from './RedisClient'
import {ChangelogModel} from './Models'
import {CHANGELOG_DIR, PROJECT_ROOT, REDIS_EXPIRY} from './Config'

Promise.promisifyAll(cp)
Promise.promisifyAll(fs)

/**
 * Helpful methods for generating and reading changelogs.  Includes automated storage and caching.
 * @param {string} user The GitHub username
 * @param {string} repo The GitHub repo name
 */
class ChangelogHelper {
  constructor(user, repo) {
    this.user = user
    this.repo = repo

    this.ghPath = `${user}/${repo}`
    this.relPath = `${CHANGELOG_DIR}/${this.ghPath}`
    this.absPath = `${PROJECT_ROOT}/${this.relPath}`
  }

  //
  // Cache
  //

  getCache() {
    console.log(`...READING CACHE: ${this.ghPath}`)
    return redisClient.getAsync(`${this.ghPath}`)
      .then(string => string)
  }

  setCache(model) {
    console.log(`...SETTING CACHE: ${this.ghPath}`)
    return redisClient.setAsync(this.ghPath, JSON.stringify(model), 'EX', REDIS_EXPIRY)
      .then(res => model)
  }

  //
  // Storage
  //

  getFromStorage() {
    console.log(`...GETTING FROM STORAGE: ${this.ghPath}`)
    return new Promise((resolve, reject) => {
      ChangelogModel.findOne({user: this.user, repo: this.repo})
        .then(model => {
          model
            ? resolve(this.setCache(model))
            : reject(`Could not find changelog for ${this.ghPath}`)
        })
    })
  }

  saveToStorage(md) {
    console.log(`...SAVING TO STORAGE: ${this.ghPath}`)
    const log = new ChangelogModel({user: this.user, repo: this.repo, md, html: marked(md)})
    return log.save()
      .then(model => this.setCache(model))
  }

  /**
   * Write CHANGELOG.md to disk, sync to s3, and set in redis
   * @returns {Promise}
   */
  generate(token) {
    const mkdir = () => {
      console.log(`...MAKING DIRECTORY: ${this.relPath}`)
      return cp.execAsync(`mkdir -p ${this.relPath}`)
    }
    const generateChangelog = () => {
      console.log(`...GENERATING CHANGELOG: ${this.ghPath} in ${this.relPath}`)
      let command = `github_changelog_generator ${this.ghPath}`
      if (token) command += ` -t ${token}`
      return cp.execAsync(command, {cwd: this.relPath})
    }
    const readFromDisk = () => {
      console.log(`...READING FROM DISK: ${this.absPath}/CHANGELOG.md`)
      return fs.readFileAsync(`${this.absPath}/CHANGELOG.md`, 'utf8')
    }

    return mkdir()
      .then(res => generateChangelog())
      .then(res => readFromDisk())
      .then(md => {
        // users provided tokens for private repo access
        // if provided, skip storage and return md
        // else store result and return only the markdown
        return token ? md : this.saveToStorage(md).then(res => res.md)
      })
  }

  /**
   * Read a CHANGELOG from cache, or storage if not there.
   * @returns {Promise}
   */
  read() {
    console.log(`...READING: ${this.ghPath}`)
    return this.getCache()
      .then(res => {
        console.log(res ? '...CACHE IS GOOD' : `...CACHE IS BAD: ${res}`)
        try {
          return res ? JSON.parse(res) : this.getFromStorage()
        } catch (e) {
          return this.getFromStorage()
        }
      })
  }
}

export default ChangelogHelper

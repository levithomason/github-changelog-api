import Promise from 'bluebird'
import cp from 'child_process'
import fs from 'fs'
import marked from 'marked';

import {CHANGELOG_DIR, PROJECT_ROOT} from './config'

Promise.promisifyAll(fs)
Promise.promisifyAll(cp)

function changelogDir(user, repo) {
  return `${CHANGELOG_DIR}/${user}/${repo}`
}

class Changelog {
  readMD(user, repo) {
    return fs.readFileAsync(`${changelogDir(user, repo)}/CHANGELOG.md`, 'utf8')
      .catch(err => {
        throw new Error(err)
      })
  }

  readHTML(user, repo) {
    return this.readMD(user, repo)
      .then(data => marked(data))
      .catch(err => {
        throw new Error(err)
      })
  }

  generateHTML(user, repo) {
    return this.generateMD(user, repo)
      .then(data => marked(data))
      .catch(err => {
        throw new Error(err)
      })
  }

  generateMD(user, repo) {
    const dir = changelogDir(user, repo)
    return cp.execAsync(`
      mkdir -p ${dir}
      cd ${dir}
      github_changelog_generator ${user}/${repo}
    `)
      .then(data => this.readHTML(user, repo))
      .catch(err => {
        throw new Error(err)
      })
  }
}

export default new Changelog()

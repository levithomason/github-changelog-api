import Promise from 'bluebird'
import cp from 'child_process'
import fs from 'fs'
import marked from 'marked'

import {CHANGELOG_DIR, PROJECT_ROOT} from './Config'

Promise.promisifyAll(fs)
Promise.promisifyAll(cp)

function getDir(user, repo) {
  return `${CHANGELOG_DIR}/${user}/${repo}`
}

function generate(user, repo) {
  const dir = getDir(user, repo)
  return cp.execAsync(`
    mkdir -p ${dir}
    cd ${dir}
    github_changelog_generator ${user}/${repo}
  `)
}

function read(user, repo, isHTML) {
  const dir = getDir(user, repo)
  return fs.readFileAsync(`${dir}/CHANGELOG.md`, 'utf8')
    .then(md => isHTML ? marked(md) : md)
}

function get(user, repo, isHTML) {
  return read(user, repo, isHTML)
    .catch(err => generate(user, repo).then(data => read(user, repo, isHTML)))
}

const changelog = {
  generate,
  read,
  get,
}

export default changelog

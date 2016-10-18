const { spawn } = require('child_process')
const fs = require('fs-promise')
const { CHANGELOG_DIR, PROJECT_ROOT } = require('./Config')

// tracks open changelog jobs
exports.completedJobs = {
  // 'Semantic-Org/Semantic-UI-React': {
  //   ...
  // }
}

const mkdir = (absPath) => new Promise((resolve, reject) => {
  console.log(`...MAKING DIRECTORY: ${absPath}`)
  try {
    fs.ensureDirSync(absPath)
    resolve(absPath)
  } catch (e) {
    reject(e)
  }
})

const generate = (ghPath, relPath, token) => new Promise((resolve, reject) => {
  console.log(`...GENERATING CHANGELOG: ${ghPath} in ${relPath}`)

  const command = 'github_changelog_generator'
  const args = [ghPath]
  if (token) args.concat(['-t', token])

  const child = spawn(command, args, { cwd: relPath })

  child.stdout.on('data', (data) => {
    console.log(`${ghPath}: ${data}`)
  })

  child.stderr.on('data', (data) => {
    console.error(`ERR --> ${ghPath}: ${data}`)
    reject(data)
  })

  child.on('close', (code) => {
    console.log(`${ghPath} exited code ${code}`)
    const response = { code, data: null, error: null, ghPath, relPath, token }

    if (code === 0) {
      try {
        resolve(Object.assign({}, response, {
          data: fs.readFileSync(`${PROJECT_ROOT}/${CHANGELOG_DIR}/${ghPath}/CHANGELOG.md`, 'utf8')
        }))
      } catch (error) {
        error.message = [
          `Could not generate changelog for /${ghPath}. `,
          `Ensure the repo exists. If it's private, please use a valid access token. `,
          error.message
        ].join('')

        reject(Object.assign({}, response, { error }))
      }
    } else {
      reject(response)
    }
  })
})

/**
 * Generate a changelog for a given GitHub user/repo.
 * @param {string} user The GitHub username
 * @param {string} repo The GitHub repo name
 * @param {string} token A Github access token
 * @returns {Promise}
 */
exports.generateChangelog = function generateChangelog(user, repo, token) {
  const ghPath = `${user}/${repo}`
  const relPath = `${CHANGELOG_DIR}/${ghPath}`
  const absPath = `${PROJECT_ROOT}/${relPath}`

  exports.completedJobs[user] = {
    [repo]: {
      data: null,
      error: null,
    },
  }

  return mkdir(absPath)
    .then(() => generate(ghPath, relPath, token))
    .then(res => {
      exports.completedJobs[user][repo] = res
    })
    .catch(res => {
      exports.completedJobs[user][repo] = res
    })
}

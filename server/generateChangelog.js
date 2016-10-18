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
  const response = { code: null, data: null, error: null, ghPath, relPath, token }
  const command = 'github_changelog_generator'
  let args = [ghPath]
  if (token) args = [...args, '-t', token]

  console.log(`...GENERATING CHANGELOG: for ${ghPath} with \`${command} ${args.join(' ')}\` in ${relPath}`)

  const child = spawn(command, args, { cwd: relPath })

  child.stdout.on('data', (data) => {
    console.log(`${ghPath}: ${data}`)
  })

  child.stderr.on('data', (data) => {
    console.error(`ERR --> ${ghPath}: ${data}`)
    // buildup the error
    if (response.error === null) {
      response.error = data
    } else {
      response.error += data
    }
  })

  child.on('close', (code) => {
    console.log(`${ghPath} exited code ${code}`)
    response.code = code

    if (code === 0) {
      try {
        response.data = fs.readFileSync(`${PROJECT_ROOT}/${CHANGELOG_DIR}/${ghPath}/CHANGELOG.md`, 'utf8')
        resolve(response)
      } catch (error) {
        error.message = [
          `Could not generate changelog for /${ghPath}. `,
          `Ensure the repo exists. If it's private, please use a valid access token. `,
          (response.error ? `\n\nSTDOUT: ${response.error}` : ''),
          '\n\nERROR MESSAGE:',
          error.message,
        ].join('')

        response.error = error.toString()

        reject(response)
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

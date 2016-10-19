const { spawn } = require('child_process')
const fs = require('fs-promise')
const { CHANGELOG_DIR, PROJECT_ROOT } = require('./Config')

// tracks open changelog jobs
exports.jobs = {
  // 'Semantic-Org/Semantic-UI-React': '...'
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

const generate = (user, repo, options) => new Promise((resolve, reject) => {
  const { token, maxIssues } = options
  const ghPath = `${user}/${repo}`
  const relPath = `${CHANGELOG_DIR}/${ghPath}`

  const command = 'github_changelog_generator'
  let args = [ghPath]
  if (token) args = [...args, '-t', token]
  if (maxIssues) args = [...args, '--max-issues', maxIssues]
  const prettyCommand = `\`${command} ${args.join(' ')}\``

  console.log(`...GENERATING CHANGELOG: for ${ghPath} with ${prettyCommand} in ${relPath}`)

  const child = spawn(command, args, { cwd: relPath })

  child.stdout.on('data', (data) => {
    console.log(`${ghPath}: ${data}`)
  })

  // buildup stderr
  let stderr = ''
  child.stderr.on('data', (data) => {
    console.error(`STDERR --> ${ghPath}: ${data}`)
    stderr += data.toString()
  })

  child.on('close', (code) => {
    console.log(`${ghPath} exited code ${code}`)

    const helpMessage = [
      `Could not generate changelog for ${ghPath}.`,
      `\n- Ensure the repo exists. If it's private, use a valid access token.`,
      `\n- GitHub might be rate limiting you. Use an access token for the highest limit.\n`,
    ].join('')

    if (code === 0) {
      try {
        resolve({
          error: null,
          data: fs.readFileSync(`${PROJECT_ROOT}/${CHANGELOG_DIR}/${ghPath}/CHANGELOG.md`, 'utf8'),
        })
      } catch (error) {
        reject({
          error: [
            helpMessage,
            (error.message ? `\n\nERROR: ${error.message}` : ''),
            (stderr ? `\n\nSTDERR: ${stderr}` : ''),
          ].join(''),
          data: null,
        })
      }
    } else {
      reject({
        error: helpMessage,
        data: null,
      })
    }
  })
})

/**
 * Generate a changelog for a given GitHub user/repo.
 * @param {string} user The GitHub username
 * @param {string} repo The GitHub repo name
 * @param {string} [options]
 * @param {string} [options.token] A Github access token
 * @param {string} [options.maxIssues] The maximum number of issues to fetch
 * @returns {Promise}
 */
exports.generateChangelog = function generateChangelog(user, repo, options) {
  const { token, maxIssues } = options
  exports.jobs[user] = {
    [repo]: { data: null, error: null }
  }

  return mkdir(`${PROJECT_ROOT}/${user}/${repo}`)
    .then(() => generate(user, repo, { token, maxIssues }))
    .then(res => {
      exports.jobs[user][repo] = res
    })
    .catch(res => {
      exports.jobs[user][repo] = res
    })
}

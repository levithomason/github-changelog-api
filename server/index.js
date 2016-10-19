const express = require('express')
const morgan = require('morgan')
const path = require('path')

const { generateChangelog } = require('./generateChangelog')
const app = express()

app
  .use(morgan('dev', {
    skip: (req, res) => !!req.url.match('/socket.io')
  }))

  .get('/', (req, res) => {
    res.sendFile(path.resolve('app/index.html'))
  })

  .get('/:user/:repo', (req, res) => {
    const { jobs } = require('./generateChangelog')
    const { user, repo } = req.params
    const job = jobs[user] && jobs[user][repo]

    if (!job)      return res.status(404).send(`There is no job for ${user}/${repo}.  Make a POST first.`)
    if (job.error) return res.status(400).send(job.error)
    if (!job.data) return res.status(302).set('Retry-After', 5).send('Working, try again in 5s.')

    res.send(job.data)
  })

  .post('/:user/:repo', (req, res) => {
    const { user, repo } = req.params
    const { token, maxIssues } = req.query

    generateChangelog(user, repo, { token, maxIssues })

    res.status(200).send([
      `Started a job for ${user}/${repo}. `,
      'Poll with a GET to check status and retrieve the changelog.'
    ].join(''))
  })

  .get('/jobs', (req, res) => {
    const { jobs } = require('./generateChangelog')
    res.json(jobs)
  })

  .all('*', (req, res) => {
    res.status(404).send([
      'Bad url parameters.',
      '',
      'Usage:',
      '  Create a changelog - POST /:user/:repo',
      '  Retrieve a changelog - GET /:user/:repo',
    ].join('\n'))
  })

const server = app.listen(process.env.PORT || 3000, () => {
  const { host = 'localhost', port } = server.address()
  console.log(`listening at http://${host}:${port}`)
})

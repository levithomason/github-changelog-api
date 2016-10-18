const express = require('express')
const morgan = require('morgan')

const { generateChangelog } = require('./generateChangelog')
const ChangeLogError = require('./ChangeLogError')
const app = express()

app
  .use(morgan('dev', {
    skip: (req, res) => !!req.url.match('/socket.io')
  }))

  .get('/:user/:repo', (req, res) => {
    const { completedJobs } = require('./generateChangelog')
    const { user, repo } = req.params

    if (!(completedJobs[user] && completedJobs[user][repo])) {
      res.status(404).send(`There is no job for ${user}/${repo}.  Make a POST first.`)
    } else {
      // set status
      if (completedJobs[user][repo].error) {
        res.status(400)
      } else if (!completedJobs[user][repo].data) {
        res.status(302).setHeader('Retry-After', 5)
      }

      res.json(completedJobs[user][repo])
    }
  })

  .post('/:user/:repo', (req, res) => {
    const { user, repo } = req.params
    const { token } = req.query

    generateChangelog(user, repo, token)

    res.status(200).send('ok')
  })

  .all('*', (req, res) => {
    res.status(400).json(new ChangeLogError(`Bad url parameters, usage: /:user/:repo`))
  })

const server = app.listen(process.env.PORT || 3000, () => {
  const { host = 'localhost', port } = server.address()
  console.log(`listening at http://${host}:${port}`)
})

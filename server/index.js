import express from 'express'
import morgan from 'morgan';

import ChangelogHelper from './ChangelogHelper'
import ChangeLogError from './ChangeLogError'
const app = express()

app.use(morgan('dev', {
  skip: (req, res) => !!req.url.match('/socket.io')
}))

app
  .post('/:user/:repo', (req, res) => {
    const {user, repo} = req.params
    const {token} = req.query
    const changelog = new ChangelogHelper(user, repo)

    changelog.generate(token)
      .then(data => {
        res.set('Content-Type', `text/plain; charset=utf-8`).send(data)
      }, err => {
        const error = new ChangeLogError(
          `Could not generate changelog for /${user}/${repo}.` +
          ` Ensure the repo exists. If it's private, please use a valid access token.`,
          err
        )
        res.status(400).json(error)
      })
  })

  .get('/:user/:repo', (req, res) => {
    const {user, repo} = req.params
    const isHTML = req.query.html !== undefined;
    const isJSON = req.query.json !== undefined;
    const changelog = new ChangelogHelper(user, repo)

    changelog.read()
      .then(data => {
        if (isJSON) {
          res.json(data)
        } else if (isHTML) {
          res.send(data.html)
        } else {
          res.set('Content-Type', `text/plain; charset=utf-8`).send(data.md)
        }
      }, err => {
        const error = new ChangeLogError(`No changelog found for ${user}/${repo}. POST to generate one.`, err)
        res.status(400).json(error)
      })
  })

  .all('*', (req, res) => {
    res.status(400).json(new ChangeLogError(`Bad url parameters, usage: /:user/:repo`))
  })

const server = app.listen(process.env.PORT || 3000, () => {
  const {host = 'localhost', port} = server.address()
  console.log(`listening at http://${host}:${port}`)
})

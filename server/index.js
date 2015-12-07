import express from 'express'
import marked from 'marked';
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
    const changelog = new ChangelogHelper(user, repo)

    changelog.generate()
      .then(data => {
        res.set('Content-Type', `text/plain; charset=utf-8`).send(data)
      }, err => {
        const error = new ChangeLogError(`Could not generate changelog for /${user}/${repo}. Does the repo exist?`, err)
        res.status(400).json(error)
      })
  })

  .get('/:user/:repo', (req, res) => {
    const {user, repo} = req.params
    const isHTML = req.query.html !== undefined;
    const changelog = new ChangelogHelper(user, repo)

    changelog.read()
      .then(data => {
        res.set('Content-Type', `text/plain; charset=utf-8`).send(isHTML ? marked(data) : data)
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

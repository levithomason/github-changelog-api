import express from 'express'
import changelog from './Changelog'
import ChangeLogError from './ChangeLogError';

const app = express()

app
  .get('/:user/:repo', (req, res) => {
    const {user, repo} = req.params;
    const isHTML = req.query.html !== undefined;

    changelog.get(user, repo, isHTML)
      .then(data => res.set('Content-Type', 'text/plain; charset=utf-8').send(data))
      .catch(err => {
        res
          .status(400)
          .send(new ChangeLogError(`Could not get a changelog for ${user}/${repo}`))
      })
  })

const server = app.listen(process.env.PORT || 3000, () => {
  const {host = 'localhost', port} = server.address()
  console.log(`listening at http://${host}:${port}`)
})

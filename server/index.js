import express from 'express'
import changelog from './changelog'

const app = express()

app
  .get('/:user/:repo', (req, res) => {
    // first try to read it
    // on error, generate it, then read it again
    changelog.readHTML(req.params.user, req.params.repo)
      .then(data => res.send(data))
      .catch(err => changelog.generateHTML(req.params.user, req.params.repo)
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err))
      )
  })

  .all('*', (req, res) => {
    res.redirect('/')
  })

const server = app.listen(process.env.PORT || 3000, () => {
  const {host = 'localhost', port} = server.address()
  console.log(`listening at http://${host}:${port}`)
})

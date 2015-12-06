import express from 'express'
import marked from 'marked';
import morgan from 'morgan';

import changelog from './Changelog'
import ChangeLogError from './ChangeLogError'
const app = express()

app.use(morgan('dev', {
  skip: (req, res) => !!req.url.match('/socket.io')
}))

app
  .get('/:user/:repo', (req, res) => {
    const {user, repo} = req.params
    const isHTML = req.query.html !== undefined;

    function success(data) {
      res
        .set('Content-Type', `text/plain; charset=utf-8`)
        .send(isHTML ? marked(data) : data)
    }

    function fail(err) {
      res
        .status(400)
        .json(new ChangeLogError(`Could not generate a changelog for ${user}/${repo}.  Does the repo exist?`, err))
    }

    changelog.read(user, repo)
      .then(res => {
        success(res)
      }, err => {
        console.log('...READ ERROR, GENERATING')
        return changelog.generate(user, repo)
          .then(res => {
            console.log('...GENERATED ...READING')
            return changelog.read(user, repo)
          })
          .then(res => {
            console.log('...READ SUCCESS')
            success(res)
          })
          .catch(err => {
            console.log(err.toString())
            fail(err)
          })
      })
  })
  .all('*', (req, res) => {
    res
      .status(400)
      .json(new ChangeLogError(`Bad url parameters, usage: /:user/:repo`))
  })

const server = app.listen(process.env.PORT || 3000, () => {
  const {host = 'localhost', port} = server.address()
  console.log(`listening at http://${host}:${port}`)
})

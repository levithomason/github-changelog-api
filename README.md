GitHub Changelog API
====================

An API for generating a changelog with the excellent [GitHub Changelog Generator](https://github.com/skywinder/github-changelog-generator).
I use it for CI/CD.

## Usage

### Create

```bash
curl -X POST github-changelog-api.herokuapp.com/:user/:repo > CHANGELOG.md
```

### Retrieve

```bash
curl github-changelog-api.herokuapp.com/:user/:repo > CHANGELOG.md
```

## Private Repo?

[Generate a token here](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20API%20token)
and pass it as a query param `?token=<your_token>`.  This will skip storage and cache as well.

```bash
curl -X POST github-changelog-api.herokuapp.com/:user/:repo?token=123 > CHANGELOG.md
```

## Query Params

### ?token=<your_token>

GitHub personal access token (for private repos).

### ?html

HTML formatted changelog.

### ?json

Get the full JSON [model](https://github.com/levithomason/github-changelog-api/blob/master/server/Models.js)
including id, timestamps, user, repo, markdown, and html.

## Contribute

### Setup

You'll need [MongoDB](https://docs.mongodb.org/manual/installation/) and [Redis](http://redis.io/) to run locally. 

1. `brew install mongodb redis`
1. `npm install`
1. `npm start`

### Dev Process

```
npm run         # help

npm start       # start server and background services
npm stop        # stop all background services
npm restart     # stop / start
```

## Credits

[skywinder/github-changelog-generator](https://github.com/skywinder/github-changelog-generator)

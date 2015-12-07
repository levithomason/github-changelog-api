GitHub Changelog API
====================

An API for generating a changelog with the excellent [GitHub Changelog Generator](https://github.com/skywinder/github-changelog-generator).
I use it for CI/CD.

## API

**Markdown**
>GET - Retreive a changelog
>https://github-changelog-api.herokuapp.com/:user/:repo
>
>POST - Creates a changelog
>https://github-changelog-api.herokuapp.com/:user/:repo


**Html**
>GET  
>https://github-changelog-api.herokuapp.com/:user/:repo?html

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

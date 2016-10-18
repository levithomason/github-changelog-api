GitHub Changelog API
====================

An API for generating a changelog with the excellent [GitHub Changelog Generator](https://github.com/skywinder/github-changelog-generator).
I use it for CI/CD.

## Usage

### Create Job

```bash
curl -X POST github-changelog-api.herokuapp.com/:user/:repo
```

### Poll for results

Poll the endpoint and check the response.

```bash
curl github-changelog-api.herokuapp.com/:user/:repo
```

#### Not Yet Complete
Response: **302**  
Payload: `{ data: null, error: null }`  
Headers: `{ Retry-After: 5 }`  

#### On Complete
Response: **200**  
Payload: `{ data: 'The Changelog string', error: null }`  

#### On Error
Response: **400**  
Payload: `{ data: 'The Changelog string', error: new Error() }`  

## Private Repo?

[Generate a token here](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20API%20token)
and pass it as a query param.

```bash
curl -X POST github-changelog-api.herokuapp.com/:user/:repo?token=123
```

## Contribute

### Setup

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

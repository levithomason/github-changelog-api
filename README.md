GitHub Changelog API
====================

An API for generating a changelog with the excellent [GitHub Changelog Generator](https://github.com/skywinder/github-changelog-generator).
I use it for CI/CD.

## Usage

### Create

Changelogs can take a while to create, this starts a job.

```bash
curl -X POST github-changelog-api.herokuapp.com/:user/:repo
```

### Retrieve

After creating a job (above), you can poll for results.

```bash
curl github-changelog-api.herokuapp.com/:user/:repo
```

#### In Progress

Continue polling until you receive a complete or error response.

|Status   | Payload                         | Headers             |
|---------|---------------------------------|---------------------|
|**302**  | `{ data: null, error: null }`   | `{ Retry-After: 5 }`| 

#### Complete

Save the payload `data` as your changelog.

|Status   | Payload                                    | Headers    |
|---------|--------------------------------------------|------------|
|**200**  | `{ data: 'The Changelog', error: null }`   |            | 

#### Error

Something went wrong, consult the payload `error`.

|Status   | Payload                               | Headers    |
|---------|---------------------------------------|------------|
|**400**  | `{ data: null, error: 'Some error' }` |            | 

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

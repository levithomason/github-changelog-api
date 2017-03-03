# [GitHub Changelog API][1]

An API for generating a changelog with the excellent [GitHub Changelog Generator](https://github.com/skywinder/github-changelog-generator).
I use it for CI/CD.

### [Try the Demo][1]

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

|Status   | Payload            | Headers             |
|---------|--------------------|---------------------|
|**302**  | `In progress...`   | `{ Retry-After: 5 }`| 

#### Complete

Save the payload `data` as your changelog.

|Status   | Payload           |
|---------|-------------------|
|**200**  | `The changelog`   | 

#### Error

Something went wrong, consult the payload `error`.

|Status   | Payload            |
|---------|--------------------|
|**400**  | `An error message` | 

## Private Repo?

[Generate a token here](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20API%20token)
and pass it as a query param.

```bash
curl -X POST github-changelog-api.herokuapp.com/:user/:repo?token=123
```
## Query Params

### ?token=<string>

Add a GitHub personal access token for access to private repos and a higher rate limit.

### ?maxIssues=<number>

Limit the number of issues fetched.  Useful for avoiding rate limits and lengthy changelog generation times.

## Contribute

### Setup

1. `npm install`
1. `npm start`

### Dev Process

1. `npm start` to start the server
1. Hack on `/server` to change the API
1. Hack on `/app` to change the demo app

## Credits

[skywinder/github-changelog-generator](https://github.com/skywinder/github-changelog-generator)

[1]: http://github-changelog-api.herokuapp.com 

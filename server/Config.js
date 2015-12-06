import path from 'path'

export const PROJECT_ROOT = path.resolve(__dirname, '..')
export const SERVER_ROOT = `${PROJECT_ROOT}/dist`
export const CHANGELOG_DIR = `changelogs`
export const CACHE_EXPIRY = 1000 // * 60 * 60 * 24 // 24 hours
export const S3_BUCKET = 'github-changelog'

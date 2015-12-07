import path from 'path'

//
// Directories
//
export const PROJECT_ROOT = path.resolve(__dirname, '..')
export const SERVER_ROOT = `${PROJECT_ROOT}/dist`
export const CHANGELOG_DIR = 'changelogs'

//
// Redis
//
export const REDIS_EXPIRY = 1000 * 60 * 60 * 24 * 5 // 5 days

//
// Mongo
//
export const MONGODB_URI = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/'
export const COLLECTION_CHANGELOGS = 'changelogs'

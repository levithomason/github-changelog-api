const path = require('path')

//
// Directories
//
exports.PROJECT_ROOT = path.resolve(__dirname, '..')
exports.SERVER_ROOT = `${exports.PROJECT_ROOT}/dist`
exports.CHANGELOG_DIR = 'changelogs'

//
// Redis
//
exports.REDIS_EXPIRY = 1000 * 60 * 60 * 24 * 5 // 5 days

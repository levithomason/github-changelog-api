import mongoose from 'mongoose'
import Promise from 'bluebird'
import {COLLECTION_CHANGELOGS, MONGODB_URI} from './Config'

const options = {
  server: {
    socketOptions: {keepAlive: 1}
  },
  replset: {
    socketOptions: {keepAlive: 1}
  }
}

mongoose.connect(MONGODB_URI, options)

//
// Changelog
//
export const ChangelogModel = mongoose.model('Changelog', {
  user: String,
  repo: String,
  contents: String,
});

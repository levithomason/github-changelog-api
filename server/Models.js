import mongoose from 'mongoose'
import {MONGODB_URI} from './Config'

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
const ChangelogSchema = new mongoose.Schema({
  user: String,
  repo: String,
  md: String,
  html: String,
}, {
  timestamps: true
})

export const ChangelogModel = mongoose.model('Changelog', ChangelogSchema)

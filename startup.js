const fs            = require('fs')
const {spawn, exec} = require('./process')
const R             = require('ramda')
const config        = require('./config')

const createDir = (dir) => {
  try {
    fs.statSync(dir)
  } catch (e) {
    exec(`mkdir ${dir}`)
  }
}

const init = () => {
  R.map(createDir, [config.logdir, config.workdir])
}

module.exports = {
  init
}

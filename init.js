const fs            = require('fs')
const { execSync }  = require('child_process')
const R             = require('ramda')
const debug         = R.memoize(require('debug'))
global.configPath    = '/etc/autodocker/config.js'

const createDir = (dir) => {
  try {
    fs.statSync(dir)
  } catch (e) {
    debug('init')(`mkdir ${dir}`)
    execSync(`mkdir ${dir}`)
  }
}

const copyConfigIfNotExists = () => {
  try {
    fs.statSync(configPath)
  } catch (e) {
    debug('init')(`config copied to ${configPath}`)
    execSync(`cp config.js ${configPath}`)
  }
}

const init = () => {
  createDir('/etc/autodocker')
  copyConfigIfNotExists()
  const config = require(configPath)
  R.map(createDir, [config.logdir, config.workdir])
}
init()
module.exports = {
  init
}

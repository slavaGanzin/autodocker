const R      = require('ramda')
const debug  = R.memoize(require('debug'))
const fs     = require('fs')
const config = require(configPath)

let proxyRules = []
const get = () => {
  try {
    return JSON.parse(fs.readFileSync(config.rulesFile))
  } catch(e) {
    write()
    return proxyRules
  }
}

const add = (host, port) => {
  debug('proxy:rules:add')(host, port)
  idx = R.findIndex(R.propEq(0, host), proxyRules)
  if (idx < 0) idx = proxyRules.length
  proxyRules[idx] = [host, `http://127.0.0.1:${port}`]
}

const write = () => {
  debug('proxy:rules:written')(proxyRules)
  fs.writeFileSync(config.rulesFile, JSON.stringify(proxyRules, null, ' '))
}

module.exports = {
  write, add, get
}

const R      = require('ramda')
const hook   = require('./hook')
const fs     = require('fs')
const config = require(configPath)

const get = () => {
  try {
    return JSON.parse(fs.readFileSync(config.rulesFile))
  } catch(e) {
    write()
    return []
  }
}

let newRules = get()
let oldRules = get()

const add = (host, port) => {
  idx = R.findIndex(R.propEq(0, host), newRules)
  if (idx < 0) idx = newRules.length
  newRules[idx] = [host, `http://127.0.0.1:${port}`]
}

const write = () => {
  if (! R.isEmpty(R.difference(oldRules, newRules))) {
    fs.writeFileSync(config.rulesFile, JSON.stringify(newRules, null, ' '))
    hook('proxy:update')(oldRules = newRules)
  }
}

module.exports = {
  write, add, get
}

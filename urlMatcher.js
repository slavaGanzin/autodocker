const R     = require('ramda')
const debug = R.memoize(require('debug'))
const config = require('./config')
const fs          = require('fs')

let matchers = []
let rules = []

const createMatcher  = ([rule, target]) =>
  R.ifElse(R.test(new RegExp(rule, 'gi')), ()=>target, ()=>null)

const updateMatchers = () => {
  let newRules = JSON.parse(fs.readFileSync(__dirname+config.rulesFile))
  if (!R.isEmpty(R.difference(newRules, rules))) {
    debug('server:matchers')(JSON.stringify(newRules, null, ' '))
  }
  rules = newRules
  matchers = R.map(createMatcher, newRules)
}
setInterval(updateMatchers, config.updateMatchersInterval)

const matchURL = (URL) => R.head(R.reject(R.isNil, R.ap(matchers, [URL])))

module.exports = {
  matchURL
}

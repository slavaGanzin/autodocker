const R          = require('ramda')
const config     = require(configPath)
const proxyRules = require('./proxyRules')

let matchers = []

const createMatcher  = ([rule, target]) =>
  R.ifElse(R.test(new RegExp(rule, 'gi')), ()=>target, ()=>null)

const updateMatchers = () => {
  matchers = R.map(createMatcher, proxyRules.get())
}

setInterval(updateMatchers, config.updateMatchersInterval)

const matchURL = (URL) => R.head(R.reject(R.isNil, R.ap(matchers, [URL])))

module.exports = {
  matchURL
}

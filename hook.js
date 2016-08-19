fs                = require('fs')
global.configPath = '/etc/autodocker/config.js'
const R           = require('ramda')
const {hooksdir}  = require(configPath)
const debug       = R.memoize(require('debug'))

const importHook = (f) => R.objOf(f.replace(/.js$/,''), require(hooksdir+'/'+f))
const hooks = R.mergeAll(R.map(importHook, fs.readdirSync(hooksdir)))

module.exports = (hook) => (...args) => {
  debug(hook)(...args)
  if (hooks[hook])
    debug(hook+':hook')(hooks[hook](...args))
}

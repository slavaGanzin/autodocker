const R                   = require('ramda')
const debug               = R.memoize(require('debug'))
const { execSync, spawn } = require('child_process')
const fs                  = require('fs')
const config              = require(configPath)

const exec = (...args) => {
  debug(...args)('')
  let result = String(execSync(...args))
  if (result) debug(...args)(result)
  return result
}

const _spawn = (args, {cwd} = {cwd: '.'}) =>
  new Promise((resolve, reject) => {
    let [command, ..._args] = R.split(' ', args)
    debug(args)(cwd)
    let file = args.replace(/[\s\/]/g,'.')
    let process = spawn(command, _args)
    let [stdout,stderr] = R.map(fs.createWriteStream, [`${config.logdir}/stdout-${file}`,`${config.logdir}/stderr-${file}`])
    
    process.stdout
      .on('data', (data)=>debug(args)("\n" + String(data)))
      .pipe(stdout)
    process.stderr
      .on('data', (data)=>debug(`stderr:${args}`)("\n" + String(data)))
      .pipe(stderr)
      
    process.on('close', (code) => code == 0 ? resolve():reject(args))
  })

module.exports = {spawn:_spawn, exec}

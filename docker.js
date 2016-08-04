const R             = require('ramda')
const debug         = R.memoize(require('debug'))
const fs            = require('fs')
const {spawn, exec} = require('./process')
const port          = require('portastic')
const config        = require(configPath)

const exposedPorts = R.compose(R.flatten, R.map(R.match(/\d+/g)), R.match(/expose.*/gi), String)
const parseDockerPorts = R.compose(R.tail, R.match(/.*:(\d+)->(\d+)/))
  
const getFreePorts = () => port.find(config.portastic)

const runImageOnPort = (image, cwd, inPort) => {
  let [outPort, ...ports] = exposedPorts(fs.readFileSync(`${cwd}/Dockerfile`))
  spawn(`docker run --interactive --detach --name ${image} --publish ${inPort}:${outPort} ${image}`)
  return inPort
}

//TODO: fix ps -a
const ps = (key='') => {
  let [columns, ...images] = R.map(R.split(/\s{2,}/), R.reject(R.equals(''), R.split("\n", exec(`docker ps ${key}`))))
  columns = R.map(x => x.toLowerCase(), columns)
  return R.map(R.compose(R.evolve({ports: parseDockerPorts}), R.zipObj(columns)), images)
}


const getRunning    = image => R.find(R.propEq('image', image), ps())
const getWasRunning = image => R.find(R.propEq('image', image), ps('-a'))

const shutdown = image =>
  exec(`docker rm -f ${image}`)

const removeIfRunning = image => {
  if (getWasRunning(image)) shutdown(image) && debug('shutdown')(image)
}

const getImageRunPortsOrFreePorts = (image) => {
  let running = getRunning(image)
  if (! running) return getFreePorts()
  let [outPort, ...inPort] = running.ports
  debug(`${image} was running on`)(outPort)
  return Promise.resolve(outPort)
}

module.exports = {
  runImageOnPort, removeIfRunning, getImageRunPortsOrFreePorts, getRunning
}

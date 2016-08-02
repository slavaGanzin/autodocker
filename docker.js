const R             = require('ramda')
const debug         = R.memoize(require('debug'))
const fs            = require('fs')
const {spawn, exec} = require('./process')
const port          = require('portastic')
const config        = require('./config')

const exposedPorts = R.compose(R.flatten, R.map(R.match(/\d+/g)), R.match(/expose.*/gi), String)

const getFreePorts = () => port.find(config.portastic)

const runImageOnPort = (image, cwd, port) => {
  let [fromPort=8083, ...ports] = exposedPorts(fs.readFileSync(`${cwd}/Dockerfile`))
  spawn(`docker run --interactive --detach --name ${image} --publish ${port}:${fromPort} ${image}`)
  return port
}

const ps = (image, key='') => {
  try {
    return !R.isEmpty(exec(`docker ps ${key} | grep -E ${image}`))
  } catch (e) {
    return false
  }
}
const isRunning = image => ps(image)
const wasRunning = image => ps(image, '-a')

const shutdown = image =>
  exec(`docker rm -f ${image}`)

const removeIfRunning = image => {
  if (wasRunning(image)) shutdown(image) && debug('shutdown')(image)
}

const getImageRunPortsOrFreePorts = (image) => {
  const clearPorts = R.map(R.replace(/.*:(\d+)->/, '$1'))
  let ports = clearPorts(R.match(new RegExp(image+'.*->'), exec('docker ps')))
  if (R.isEmpty(ports)) return getFreePorts()
  debug(`${image} was running on`)(ports)
  return Promise.resolve(ports)
}

module.exports = {
  runImageOnPort, isRunning, wasRunning, shutdown, removeIfRunning, getImageRunPortsOrFreePorts
}

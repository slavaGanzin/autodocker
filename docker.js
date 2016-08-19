const R             = require('ramda')
const hook          = require('./hook')
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
  hook('docker:run')(image, inPort, outPort)
  return inPort
}

const ps = (key='') => {
  let [columns, ...images] = R.map(R.split(/\s{2,}/), R.reject(R.equals(''), R.split("\n", exec(`docker ps ${key}`))))
  columns = R.map(x => x.toLowerCase(), columns)
  return R.map(R.compose(R.evolve({ports: parseDockerPorts}), R.zipObj(columns)), images)
}


const getRunning    = image => R.find(R.propEq('image', image), ps())

const remove = image => {
  hook('docker:remove')(image)
  exec(`docker rm -f ${image} 2> /dev/null; echo`)
}

const getImageRunPortsOrFreePorts = (image) => {
  let running = getRunning(image)
  if (! running) return getFreePorts()
  let [outPort, ...inPort] = running.ports
  return Promise.resolve(outPort)
}

const build = ({image, cwd}) => {
  hook('docker:build')(image)
  return spawn(`docker build --tag ${image} ${cwd}`)
  .catch(hook('docker:build:failed'))
  .then(hook('docker:build:finished'))
}

module.exports = {
  runImageOnPort, remove, getImageRunPortsOrFreePorts, getRunning, build
}

const R             = require('ramda')
const port          = require('portastic')
const debug         = R.memoize(require('debug'))
const fs            = require('fs')
const {spawn, exec} = require('./process')

const {
  repositories, timeout, workdir, portastic, rulesFile
} = require('./config')

let proxyRules = []
const clearProxyRules = () => proxyRules = []
const addToProxyRules = (host, port) => {
  debug('proxy:rules:add')(host, port)
  proxyRules.push([host, `http://127.0.0.1:${port}`])
}
const refreshDns = (image) =>
  exec(`echo "address=/${image}/127.0.0.1" >> /etc/dnsmasq.conf && pkill dnsmasq; dnsmasq`)

const writeProxyRules = () => {
  debug('proxy:rules:written')(proxyRules)
  fs.writeFileSync(__dirname+rulesFile, JSON.stringify(proxyRules, null, ' '))
}

const getFreePorts = () => port.find(portastic)

const createWorkDir = () => {
  try {
    fs.statSync(workdir)
  } catch (e) {
    exec(`mkdir ${workdir}`)
  }
}

const cloneRepoIfNotExists = ({path, cwd}) => {
  try {
    fs.statSync(cwd)
  } catch (e) {
    exec(`git clone ${path} ${cwd}`)
  }
}

const parseStdout = R.compose(R.reject(R.isEmpty), R.split('\n'), String)
const removeSelectedBranch = R.map(R.replace(/^\*\s+/,''))
const removeOrigin = R.map(R.replace(/^\s+origin\//,''))
const removeHEAD = R.reject(R.test(/HEAD/))
  
const getRemoteBranchesHEAD = (cwd) =>
  removeOrigin(removeHEAD(parseStdout(exec("git branch -r -v --no-color", {cwd}))))
  
const getLocalBranchesHEAD = (cwd) =>
  removeSelectedBranch(parseStdout(exec("git branch -v --no-color", {cwd})))

const getNotUpdatedRefs = (cwd) => {
  let refs = [R.head(R.difference(getRemoteBranchesHEAD(cwd), getLocalBranchesHEAD(cwd)))]
  debug('not:updated:refs')(refs)
  return refs
}
  
const updateBranches = (cwd) => exec("git fetch -a", {cwd})

const runImageOnPort = (image, cwd, port) => {
  let [fromPort=8083, ...ports] = exposedPorts(fs.readFileSync(`${cwd}/Dockerfile`))
  spawn(`docker run --interactive --tty --detach --name ${image} --publish ${port}:${fromPort} ${image}`)
  return port
}

const isRunning = image => {
  try {
    return !R.isEmpty(exec(`docker ps -a | grep -E ${image}`))
  } catch (e) {
    return false
  }
}
  
const shutdownKernel = image =>
  exec(`docker rm -f ${image}`)

const shutdownIfRunning = image => {
  if (isRunning(image)) shutdownKernel(image) && debug('shutdown')(image)
}

const exposedPorts = R.compose(R.flatten, R.map(R.match(/\d+/g)), R.match(/expose.*/gi), String)


const buildBranches = ({cwd, refs, name}) => {
  sequence = Promise.resolve()
  exec(`git pull --all`, {cwd})
  R.map(ref => {
    sequence = sequence
    .then( () => {
      let [,branch, commit, message] = R.match(/(\w+)\s+(\w+)\s+(.*)/,ref)
      let image = `${name}.${branch}`.toLowerCase().replace(/[\/]/g, '.').split('.').reverse().join('.')
      debug("branch")(branch, commit, message)
      
      exec(`git checkout ${branch}`, {cwd})
      return getFreePorts().then((ports) => [image, R.head(ports)])
    })
    .then(([image, port]) =>
      spawn(`docker build --tag ${image} ${cwd}`)
      .then(() => shutdownIfRunning(image))
      .then(() => addToProxyRules(image, port))
      .then(() => refreshDns(image))
      .then(() => runImageOnPort(image, cwd, port))
      .catch(debug('error'))
    )
  }, refs)
  
  return sequence
}

const processRepos = R.map((path) => {
  const name = path.replace(/.*\/\/.*\/(.*\/.*)\.git/, '$1')
  const cwd = [workdir,name].join('/')
  cloneRepoIfNotExists({path, cwd})
  clearProxyRules()
  buildBranches({cwd, name, refs: getNotUpdatedRefs(cwd)})
  .then(writeProxyRules)
})

createWorkDir()
module.exports = () => processRepos(repositories)

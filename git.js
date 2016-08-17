const R      = require('ramda')
const fs     = require('fs')
const {exec} = require('./process')

const removeGithub = R.compose(R.replace(/.git$/,''), R.replace(/.*git@github.com:/,''))

const cloneIfNotExists = ({path, cwd}) => {
  try {
    fs.statSync(cwd)
  } catch (e) {
    exec(`git clone ${path} ${cwd}`)
  }
}

const parseStdout = R.compose(R.reject(R.isEmpty), R.split('\n'), String)
const removeSelectedBranch = R.map(R.replace(/^(\*)?\s+/,''))
const removeOrigin = R.map(R.replace(/^\s*origin\//,''))
const removeHEAD = R.reject(R.test(/HEAD/))

const getRemoteBranchesHEAD = cwd =>
  removeOrigin(removeHEAD(parseStdout(exec("git branch -r -v --no-color", {cwd}))))
  
const getLocalBranchesHEAD = cwd =>
  removeSelectedBranch(parseStdout(exec("git branch -v --no-color", {cwd})))

const updateBranches = cwd => exec("git fetch --all", {cwd})

const checkout = ({cwd, branch}) => exec(`git checkout ${branch}`, {cwd})
const pull = cwd => exec(`git pull`, {cwd})

const parseRef = (ref, name) => {
  const parseRef = R.match(/(\S+)\s+(\w+)\s+(.*)/)
  
  let [,branch, commit, message] = parseRef(ref)
  let image = `${removeGithub(name)}.${branch}`.toLowerCase().replace(/[\/]/g, '.').split('.').reverse().join('.')
  return {branch, commit, message, image}
}

module.exports = {
  getRemoteBranchesHEAD, getLocalBranchesHEAD, updateBranches, cloneIfNotExists, checkout, pull, parseRef
}

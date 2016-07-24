module.exports = {
  timeout: process.env.TIMEOUT || 1000,
  repositories: {
    autodocker: "git@github.com:slavaGanzin/autodocker.git"
  },
  'workdir': '/tmp/autodocker'
}

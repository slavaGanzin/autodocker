module.exports = {
  timeout: process.env.TIMEOUT || 1000,
  repositories: {
    autodocker: "git@github.com:slavaGanzin/autodocker.git"
  },
  workdir: '/tmp/autodocker',
  portastic: {
    min: 8000,
    max: 9000
  },
  proxy: {
      changeOrigin: true,
      autoRewrite: true,
      hostRewrite: true,
      ws: true,
      xfwd: true
  }
}

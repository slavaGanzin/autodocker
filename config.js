module.exports = {
  repositories: [
    'https://github.com/slavaGanzin/autodockerHelloWorld.git'
  ],
  workdir: '/tmp/autodocker',
  logdir: '/var/log/autodocker',
  rulesFile: '/tmp/autodocker/proxyRules.json',
  portastic: {
    min: 60000,
    max: 61000
  },
  proxy: {
      changeOrigin: true,
      autoRewrite: true,
      hostRewrite: true,
      ws: true,
      xfwd: true
  },
  updateMatchersInterval: 1000
}

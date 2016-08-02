module.exports = {
  timeout: process.env.TIMEOUT || 1000,
  repositories: [
    'https://github.com/slavaGanzin/autodockerHelloWorld.git'
  ],
  workdir: '/tmp/autodocker',
  portastic: {
    min: 60000,
    // max: 61000
    max: 60002
  },
  proxy: {
      changeOrigin: true,
      autoRewrite: true,
      hostRewrite: true,
      ws: true,
      xfwd: true
  },
  rulesFile: '/tmp/autodocker/proxyRules.json',
  updateMatchersInterval: 1000
}

module.exports = {
  user: 'vganzin',
  repositories: [
    'https://github.com/slavaGanzin/autodockerHelloWorld.git'
  ],
  workdir: '/tmp/autodocker',
  logdir: '/var/log/autodocker',
  rulesFile: '/tmp/autodocker/proxy.json',
  hooksdir: '/etc/autodocker/hooks',
  dnsmasqConf: process.env.DNSMASQ_CONF || '/etc/autodocker/dnsmasq.conf',
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

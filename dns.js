const {spawn, exec} = require('./process')

let localIp

const updateDnsmasq = (image) =>
  exec(`(grep "${image}/${localIp}" /etc/dnsmasq.conf || echo "address=/${image}/127.0.0.1" >> /etc/dnsmasq.conf) && pkill dnsmasq; dnsmasq`)

require('dns').lookup(require('os').hostname(), (err, ip, fam) => localIp = ip)

module.exports = {
  updateDnsmasq
}

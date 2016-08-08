const {spawn, exec} = require('./process')
const ip = require("ip");

let localIp = ip.address()

let dns = []

const updateDnsmasq = (image) =>
  exec(`(grep "${image}/${localIp}" /etc/dnsmasq.conf || echo "address=/${image}/${localIp}" >> /etc/dnsmasq.conf) && pkill dnsmasq; dnsmasq`)

module.exports = {
  updateDnsmasq
}

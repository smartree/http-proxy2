const http = require('http')
const net = require('net')
const PacketHub = require('./PacketHub3')
const util = require('./util')
const Emit = require('./EventEmit')

const packetHub = new PacketHub()

const HOST = '127.0.0.1';
const PORT = 9999;

const client = new net.Socket();

client.connect(PORT, HOST)

client.on('data', (data) => {
  packetHub.push(data)
})

Emit.on('fullpacket', (key, fullPacket) => {
  const {
    method, path, headers, body
  } = util.splitRequest(fullPacket)

  console.log(`[${util.getNowDate()}] ${method} - ${path}`)

  const req = http.request({
    host: '127.0.0.1',
    port: 3000,
    path,
    method,
    headers
  }, res => {
    const resValue = []
    res.on('data', (chunk) => {
      resValue.push(chunk)
    })
    res.on('end', () => {
      const result = util.generateResponse({code: res.statusCode, message: res.statusMessage, headers: res.headers, body: Buffer.concat(resValue)})
      client.write(util.createWrappedBuf(key, result))
    })
  })

  if (method.trim().toLowerCase() === 'post') {
    req.write(body)
  }
  req.on('error', (e) => console.log(e))
  req.end()
})
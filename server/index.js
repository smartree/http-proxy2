const net = require('net')
const Emit = require('./EventEmit')
const PacketHub = require('./PacketHub')
const util = require('./util')

const packetHub = new PacketHub()

let tunnelSocket = null
let serverResponses = {}

const tunnel = net.createServer(socket => {
  tunnelSocket = socket
  socket.on('data', (data) => { // 接收到内网主机发来的消息, 内网主机发来的消息是已经包裹完毕的
    packetHub.push(data)
    console.log(packetHub.toString())
  })
})

tunnel.listen(9999)

const http = require('http');

const server = http.createServer((request, response) => {
  const method = request.method
  const path = request.url
  const headers = request.headers
  const version = request.httpVersion

  const key = util.generateKey()
  serverResponses[key] = response

  console.log('key: ', key, ' recevied!')

  if (method === 'POST') {
    let body = []
    request.on('data', (chunk) => {
      body.push(chunk)
    })
    request.on('end', () => {
      Emit.emit('recvReq', { key, method, version, path, headers, body })
    })
  } else {
    Emit.emit('recvReq', { key, method, version, path, headers })
  }
})
server.setMaxListeners(5)
server.listen(8080)

Emit.on('recvReq', ({ key, method, version, path, headers, body = '' }) => {
  const header = util.generateRequest({method, version, path, headers, body})
  const buf = Buffer.from(header)
  tunnelSocket.write(util.createWrappedBuf(key, buf))
})

Emit.on('fullpacket', (key, fullPacket) => {
  const {
    body, headers, status
  } = util.splitResponse(fullPacket)

  serverResponses[key].writeHead(status, headers)
  serverResponses[key].end(body)
  delete serverResponses[key]
  console.log('key: ', key, ' resolved!')
})





































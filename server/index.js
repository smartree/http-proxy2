const net = require('net')
const Emit = require('./EventEmit')
const PacketHub = require('./PacketHub3')
const util = require('./util')
const http = require('http')

const packetHub = new PacketHub()

let tunnelSocket = null
let serverResponses = {}
let tunnel = null

const createConnectionToTunnel = () => {
  tunnel = net.createServer(socket => {
    console.log('客户机连接成功！')
    tunnelSocket = socket
    socket.on('data', (data) => { // 接收到内网主机发来的消息, 内网主机发来的消息是已经包裹完毕的
      packetHub.push(data)
    })
    socket.on('close', () => {
      tunnel.close()
      tunnel = null
      tunnelSocket = null
      packetHub.clear()
      console.log('客户机断开，3秒后重新开始监听9999端口')
      setTimeout(() => {
        createConnectionToTunnel()
      }, 3000)
    })
  }).listen(9999)
}

createConnectionToTunnel()

const server = http.createServer((request, response) => {
  const method = request.method
  const path = request.url
  const headers = request.headers
  const version = request.httpVersion
  const key = util.generateKey()

  serverResponses[key] = response
  response.setTimeout(5 * 1e3)

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

console.log('开始监听8080端口')
server.listen(8080)
Emit.on('recvReq', ({ key, method, version, path, headers, body = '' }) => {
  const header = util.generateRequest({method, version, path, headers, body})
  const buf = Buffer.from(header)
  const packet = util.createWrappedBuf(key, buf)
  if (tunnelSocket) {
    console.log(`[${util.getNowDate()}] Proxy: ${method} - ${path}`)
    tunnelSocket.write(packet)
  } else {
    serverResponses[key].end('There is no client, please connect client to proxy request!')
  }
})

Emit.on('fullpacket', (key, fullPacket) => {
  const {
    body, headers, status
  } = util.splitResponse(fullPacket)

  if (serverResponses[key]) {
    try {
      serverResponses[key].writeHead(status, headers)
      serverResponses[key].end(body)
    } catch (e) {
      serverResponses[key].end()
      console.log(e)
    }
    delete serverResponses[key]
  }
})

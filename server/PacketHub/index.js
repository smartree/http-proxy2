const Emit = require('../EventEmit/')
const Packet = require('./Packet')

class PacketHub {
  constructor() {
    this.packets = []
    this.length = []
  }

  push(buf) {
    this.packets.push(new Packet(buf))
    this.length = this.packets.length

    this.analyseFullPacket()
  }

  toString() {
    return this.packets.map(packet => ({ key: packet.key, length: packet.originalLength, packetLength: packet.packetLength }))
  }

  analyseFullPacket() {
    let nowLength = 0,              // 目前已读取的长度
        packetLength = 0,           // 包总长
        startIndex = 0,             // 起始包的索引
        endIndex = 0                // 终结包的索引
    let startRecord = false
    let finishRecord = false

    for (let i = 0; i < this.length; i ++) {
      const packet = this.packets[i]
      if (startRecord) {                    // 找到了起始包，开始记录
        endIndex = i                        // 令终结索引等于当前索引
        nowLength += packet.originalLength  // 添加当前已读长度
        if (nowLength >= packetLength) {   // 如果当前已读长度 等于 包总长，则弹出循环
          finishRecord = true
          break
        }
      } else if (packet.isStartPacket) {    // 这个包是起始包       
        endIndex = startIndex = i
        packetLength = packet.packetLength
        nowLength = packet.originalLength
        startRecord = true
        if (nowLength >= packetLength) {   // 如果当前已读长度 等于 包总长，则弹出循环
          finishRecord = true
          break
        }
      }
    }

    if (finishRecord) {
      const fullPacketList = this.packets.splice(startIndex, endIndex - startIndex + 1).map(packet => packet.originalData)

      this.length = this.packets.length
      const buf = Buffer.concat(fullPacketList, packetLength + 16)
      const key = Packet.getPacketKey(buf)
      const bufWithoutKeyAndLength = buf.slice(16)
      Emit.emit('fullpacket', key, bufWithoutKeyAndLength)
      this.analyseFullPacket()
    }
  }
}

module.exports = PacketHub
const Emit = require('../EventEmit/')
const Packet = require('./Packet')

class PacketHub {
  constructor() {
    this.packets = []
    this.length = 0
    this.data = Buffer.alloc(0)
    this.intervalId = setInterval(() => {
      try {
        console.log(this.length)
        console.log(this.packets)
        this.analyseFullPacket()
      } catch(e) {
        console.log(e)
        clearInterval(this.intervalId)
      }
    }, 16)
  }

  push(buf) {
    const packet = new Packet(buf)
    if (packet.isStartPacket) {
      this.packets.push({
        key: packet.key,
        packetLength: packet.packetLength,
      })
    }
    this.data = Buffer.concat([this.data, packet.packetData])
    this.length = this.data.length
  }

  toString() {
    return this.packets.map(packet => ({key: packet.key, length: packet.packetLength}))
  }

  analyseFullPacket() {
    if (this.packets.length == 0) {
      return 
    }
    const packetInfo = this.packets[0]
    const { key, packetLength } = packetInfo
    if (packetLength === 0) {
      this.packets.shift(0)
      return
    }
    if (packetLength > this.length) {
      return
    }
    const packetBuffer = this.data.slice(0, packetLength)
    Emit.emit('fullpacket', key, packetBuffer)
    this.data = this.data.slice(packetLength)
    this.length = this.data.length
    this.packets.shift(0)
  }
}

module.exports = PacketHub
const Emit = require('../EventEmit/')

class PacketHub {
  constructor() {
    this.data = Buffer.alloc(0)
    this.intervalId = setInterval(() => {
      try {
        this.analyseFullPacket()
      } catch(e) {
      }
    }, 16)
  }

  push(buf) {
    this.data = Buffer.concat([this.data, buf])
  }

  toString() {
    return this.data.length
  }

  analyseFullPacket() {
    if (this.data.length < 16) { return }
    const nextPacketLength = this.data.readUIntBE(0, 8)
    const nextPacketKey = this.data.readUIntBE(8, 8)
    if (`${nextPacketKey}`.length !== 7) {
      throw new Error('error! 起始位错误')
    }
    if (nextPacketLength <= this.data.length - 16) {
      const packetBuffer = this.data.slice(16, nextPacketLength + 16)
      Emit.emit('fullpacket', nextPacketKey, packetBuffer)
      this.data = this.data.slice(16 + nextPacketLength)
    }
  }
  
  clear() {
    this.data = Buffer.alloc(0)
  }
}

module.exports = PacketHub
/**
 * 0    -    7      8    -    15 
 *   length             key
 * 
 * 16           -             X
 * D         A      T         A
 */
class Packet {
  /**
   * 
   * @param {Buffer} buf 
   */
  constructor(buf) {
    this.originalData = buf

    // waiting to init
    this.originalLength = 0    // 包数据位的长度
    this.packetLength = 0      // 如果这个包是起始包，则表示包数据位总长。如果不是，则为0
    this.packetData = null     // 包数据位内容
    this.isStartPacket = false
    this.key = null
    this.data = null

    this.startPacketAnalyse()
  }

  startPacketAnalyse() {
    try {
      this.packetLength = this.originalData.readUIntBE(0, 8)
      this.key = this.originalData.readUIntBE(8, 8)
      if (`${this.key}`.length !== 7) {
        throw new Error('not start Packet')
      }
      this.isStartPacket = true
      this.originalLength = this.originalData.length - 16
      this.packetData = this.originalData.slice(16)
    } catch(e) {
      this.originalLength = this.originalData.length
      this.isStartPacket = false
      this.packetLength = 0
      this.key = null
      this.packetData = this.originalData
    }
    console.log(`pl: ${this.packetLength}`)
    console.log(`key: ${this.key}`)
  }
}

Packet.getPacketKey = function(buf) {
  try {
    return buf.readUIntBE(8, 8)
  } catch(e) {
    console.log(e)
    return -1
  }
}

module.exports = Packet
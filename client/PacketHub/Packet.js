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
    this.originalLength = 0 
    this.packetLength = 0
    this.isStartPacket = false
    this.key = null
    this.data = null

    this.analyse()
  }

  analyse() {
    this.startPacketAnalyse()
  }

  startPacketAnalyse() {
    try {
      this.packetLength = this.originalData.readUIntBE(0, 8)
      this.key = this.originalData.readUIntBE(8, 8)
      if (`${this.key}`.length > 9) {
        throw new Error('not start Packet')
      }
      this.isStartPacket = true
      this.originalLength = this.originalData.length - 16
    } catch(e) {
      this.isStartPacket = false
      this.packetLength = 0
      this.key = null
      this.originalLength = this.originalData.length
    }
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
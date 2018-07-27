const colors = require('./colors')

const util = {
  createWrappedBuf: (key, buf) => {
    const length = buf.length
    const _buf = Buffer.alloc(16, 0)
    _buf.writeUIntBE(length, 0, 8)
    _buf.writeUIntBE(key, 8, 8)
    return Buffer.concat([_buf, buf], 16 + length)
  },
  generateKey: () => {
    return util.randomNum(1e6, 1e7)
  },
  objToStr: (obj) => {
    let retValue = []
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        retValue.push(`${i}: ${obj[i]}`)
      }
    }
    return retValue.join('\n')
  },
  generateRequest: ({
    method,
    version,
    path,
    headers,
    body = ''
  }) => {
    return `${method} ${path} HTTP/${version}\n` +
      `${util.objToStr(headers)}${body !== '' ? `\n\n${body}` : ''}`
  },
  splitResponse: (responseBuffer) => {
    const headerArray = []
    const bufferLength = responseBuffer.length
    let body = null
    let startIndex = 0
    let raw = ''

    for (let i = 0; i < bufferLength; i++) {
      const char = String.fromCharCode(responseBuffer[i])
      if (char === '\n') {
        raw = responseBuffer.toString('ascii', startIndex, i)
        if (raw.trim() === '') {
          body = responseBuffer.slice(i + 1)
          break
        }
        headerArray.push(raw)
        startIndex = i + 1
      }
    }

    const status = ~~(headerArray.shift(0).split(' ')[1])
    const headers = {}
    headerArray.map(item => {
      const splitIndex = item.indexOf(':')
      return [item.slice(0, splitIndex).trim(), item.slice(splitIndex + 1).trim()]
    }).forEach(item => {
      headers[item[0]] = item[1]
    })
    return {
      status,
      headers,
      body
    }
  },
  randomNum: (Min, Max) => { // min ≤ r < max
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.floor(Rand * Range);
    return num;
  },
  formatNumber: (number) => {
    return `${number}`.toString().padStart(2, 0)
  },
  getNowDate: () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = util.formatNumber(now.getMonth() + 1)
    const date = util.formatNumber(now.getDate())
    const hour = util.formatNumber(now.getHours())
    const minute = util.formatNumber(now.getMinutes())
    const second = util.formatNumber(now.getSeconds())
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`
  },
  log: (msg) => {
    console.log(`${colors.green(`[${util.getNowDate()}]`)} ${msg}`)
  }
}

module.exports = util
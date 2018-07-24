const util = {
  createWrappedBuf: (key, buf) => {
    const length = buf.length
    const _buf = Buffer.alloc(16, 0)
    _buf.writeUIntBE(length, 0, 8)
    _buf.writeUIntBE(key, 8, 8)
    return Buffer.concat([_buf, buf], 16 + length)
  },
  generateKey: () => {
    return ~~(Math.random() * 1e9)
  },
  objToStr: (obj) => {
    let retValue = []
    for(let i in obj) {
      retValue.push(`${i}: ${obj[i]}`)
    }
    return retValue.join('\n')
  },
  splitRequest: (requestBuffer) => {
    const headerArray = []
    const bufferLength = requestBuffer.length
    let body = null
    let startIndex = 0
    let raw = ''

    for(let i = 0; i < bufferLength; i++) {
      const char = String.fromCharCode(requestBuffer[i])
      if (char === '\n' || i === bufferLength - 1) {
        raw = requestBuffer.toString('ascii', startIndex, i)
        if (raw.trim() === '') {
          body = requestBuffer.slice(i + 1)
          break
        }
        headerArray.push(raw)
        startIndex = i + 1
      }
    }

    const firstLine = headerArray.shift(0).split(' ')

    const method = firstLine[0]
    const path = firstLine[1]
    const headers = {}
    headerArray.map(item => {
      const splitIndex = item.indexOf(':')
      return [item.slice(0, splitIndex).trim(), item.slice(splitIndex + 1).trim()]
    }).forEach(item => {
      headers[item[0]] = item[1]
    })
    return { method, path, headers, body }
  },
  generateResponse: ({code, message, headers, body}) => {
    const result = []
    result.push(`HTTP ${code} ${message}`)
    for (let headerName in headers) {
      result.push(`${headerName}: ${headers[headerName]}`)
    }
    result.push('\n')
    const buf = Buffer.from(result.join('\n'))
    return Buffer.concat([buf, body])
  }
}

module.exports = util
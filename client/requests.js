const http = require('http')
const util = require('./util')

/**
 * 
 * @return {Buffer} response with header
 */
const sendRequest = ({ host, port, path, method, headers, body = '' }) => {
  return new Promise(resolve => {
    const req = http.request({
      host,
      port,
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
        resolve(result)
      })
    })
  
    if (method.trim().toLowerCase() === 'post') {
      req.write(body)
    }
    req.on('error', (e) => {
      const result = util.generateResponse({code: 500, message: 'Server Error', headers: {Server: 'proxy'}, body: Buffer.from(`Client can't send request to Proxy Server`)})
      resolve(result)
    })
    req.end()
  })
}

module.exports = sendRequest
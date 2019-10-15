
const request = require('request')

const getJson = async function (url, data, headers) {
  if (!url || !data) return

  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  try {
    const result = await new Promise((resolve, reject) => {
      const smsRequest = request.get(
        url,
        { headers: headers, qs: data },
        (err, res, body) => {
          if (err) {
            _printError(`[getJson] error`, `url=${url}, data=${JSON.stringify(data)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${body}`)
            reject(err)
          }
          else {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              _printLog(`[getJson] success`, `url=${url}, data=${JSON.stringify(data)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${body}`)
              let _body = body
              try { _body = JSON.parse(body) } catch (error) { }
              resolve({ status: res && res.statusCode, body: _body })
            }
            else {
              _printError(`[getJson] network error`, `url=${url}, data=${JSON.stringify(data)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${body}`)
              reject({ status: res && res.statusCode, message: res && res.statusMessage, body })
            }
          }
        }
      )
    })

    return result
  }
  catch (error) {
    _printError(`[getJson] error`, url, data, headers, error)
  }

  return
}

const postJson = async function (url, data, headers) {
  if (!url || !data) return

  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  try {
    const result = await new Promise((resolve, reject) => {
      const smsRequest = request.post(
        url,
        { headers: headers, json: data },
        (err, res, body) => {
          if (err) {
            _printError(`[postJson] error`, `url=${url}, data=${JSON.stringify(data)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${JSON.stringify(body)}`)
            reject(err)
          }
          else {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              _printLog(`[postJson] success`, `url=${url}, data=${JSON.stringify(data)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${JSON.stringify(body)}`)
              resolve({ status: res && res.statusCode, body })
            }
            else {
              _printError(`[postJson] network error`, `url=${url}, data=${JSON.stringify(data)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${JSON.stringify(body)}`)
              reject({ status: res && res.statusCode, message: res && res.statusMessage, body })
            }
          }
        }
      )
    })

    return result
  }
  catch (error) {
    _printError(`[postJson] error`, url, data, headers, error)
  }

  return
}

const postFormData = async function (url, formData, headers) {
  if (!url || !formData) return

  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  try {
    const result = await new Promise((resolve, reject) => {
      const smsRequest = request.post(
        url,
        { headers: headers, formData: formData },
        (err, res, body) => {
          if (err) {
            _printError(`[postFormData] error`, `url=${url}, formData=${JSON.stringify(formData)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${body}`)
            reject(err)
          }
          else {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              _printLog(`[postFormData] success`, `url=${url}, formData=${JSON.stringify(formData)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${body}`)
              let _body = body
              try { _body = JSON.parse(body) } catch (error) { }
              resolve({ status: res && res.statusCode, body: _body })
            }
            else {
              _printError(`[postFormData] network error`, `url=${url}, formData=${JSON.stringify(formData)}, headers=${JSON.stringify(headers)}, err=`, err, `, res.statusCode=${res && res.statusCode}, res.statusMessage=${res && res.statusMessage},  body=${body}`)
              reject({ status: res && res.statusCode, message: res && res.statusMessage, body: body })
            }
          }
        }
      )
    })

    return result
  }
  catch (error) {
    _printError(`[postFormData] error`, url, formData, headers, error)
  }

  return
}

module.exports = { postJson, postFormData, getJson }

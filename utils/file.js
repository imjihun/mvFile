
const path = require('path')
const fs = require('fs')

const readFile = (_path) => {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  try {
    const str = fs.readFileSync(_path, 'utf8')
    return str || ''
  }
  catch (error) {
    _printError('[readFile] error', _path, error)
  }
}

const unlink = (filepath) => {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  try {
    return fs.unlink(filepath, (error) => error && _printError(`[unlink] [${filepath}] error`, error))
  }
  catch (error) {
    _printError('[unlink] error', filepath, error)
  }
}

const mkdir = (dirpath, mode) => {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  try {
    fs.mkdirSync(dirpath, mode)
    return true
  }
  catch (error) {
    _printError('[mkdir] error', dirpath, mode, error)
  }
}

const checkDir = (dirpath) => {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  let stackIndex = 0
  const _checkDir = (_dirpath) => {
    try {
      stackIndex++

      const dirname = path.dirname(_dirpath)
      if (stackIndex < 10 && dirname && dirname !== '.' && dirname !== '/') {
        _checkDir(dirname)
      }

      if (_dirpath && _dirpath !== '.' && _dirpath !== '/') {
        const isExists = fs.existsSync(_dirpath)
        if (isExists) return true
        fs.mkdirSync(_dirpath)
      }
      return true
    }
    catch (error) {
      _printError('[checkDir]', error)
    }
    return false
  }
  const res = _checkDir(dirpath)

  // if (res) return next()
  return res
}

const filecallback = async function (_path, callbackEachFile) {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  if (!_path) return false
  if (!fs.existsSync(_path)) return false

  const stat = fs.statSync(_path)
  if (!stat) return false

  let type = ''
  if (stat.isFile()) type = 'F'
  else if (stat.isDirectory()) type = 'D'
  else if (stat.isBlockDevice()) type = 'B'
  else if (stat.isCharacterDevice()) type = 'C'
  else if (stat.isSymbolicLink()) type = 'S'
  else if (stat.isFIFO()) type = 'F'
  else if (stat.isSocket()) type = 'S'

  // _printLog(`[filecallback] type=${type}, _path=${_path}`)

  switch (type) {
    case 'D':
      const filenameList = fs.readdirSync(_path)
      if (!filenameList) return false

      const resList = await Promise.all(filenameList.map(async (filename, index) => {
        const fullfilepath = path.join(_path, filename)
        return filecallback(fullfilepath, callbackEachFile)
      }))

      let retval = false
      retval = resList && resList.reduce((_retval, res) => _retval && !!res, true)
      return retval
    case 'F':
      return typeof callbackEachFile === 'function' && await callbackEachFile(_path, type, stat)
    default:
      __printError(`[filecallback] error undefined type=${type}`)
      break
  }
  return false
}

const rename = function (oldpath, newpath) {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  if (!oldpath || !newpath) return
  try {
    if (!fs.existsSync(oldpath)) {
      _printError(`[rename] error oldpath not found oldpath=${oldpath}`)
      return
    }
    if (fs.existsSync(newpath)) {
      _printError(`[rename] error newpath already exists newpath=${newpath}`)
      return
    }

    fs.renameSync(oldpath, newpath)
    return true
  }
  catch (error) {
    _printError(`[rename] error`, error)
  }
}

const copyFile = function (src, dst) {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  if (!src || !dst) return
  try {
    if (!fs.existsSync(src)) {
      _printError(`[copyFile] error src not found src=${src}, dst=${dst}`)
      return
    }
    if (fs.existsSync(dst)) {
      _printError(`[copyFile] error dst already exists src=${src}, dst=${dst}`)
      return
    }

    checkDir(path.dirname(dst))

    fs.copyFileSync(src, dst)
    return true
  }
  catch (error) {
    _printError(`[copyFile] error src=${src}, dst=${dst}`, error)
  }
}

module.exports = {
  readFile,
  unlink,
  mkdir,
  checkDir,
  filecallback,
  rename,
  copyFile,
}

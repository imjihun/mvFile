
const { convertXlsxWorksheetToJson } = require(`../utils/xlsx.js`)
const { copyFile, filecallback } = require(`../utils/file.js`)
const { config } = require(`./config.js`)

const fs = require(`fs`)
const path = require(`path`)
const moment = require(`moment`)

const IS_DEV = process.env.NODE_ENV === 'dev'

const __printLog = (...params) => console.log(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}][LOG]`, ...params)
const __printError = (...params) => console.log(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}][ERROR]`, ...params)

global.__printLog = __printLog
global.__printError = __printError

__printLog(`start contentsUploader argv=${JSON.stringify(process.argv)}`)


const getData = function (columnTitleList, dataFormat, data) {
  return Object.keys(dataFormat)
    .reduce((obj, key) =>
      typeof dataFormat[key] === `number`
        ? (
          key === `createdAt` || key === `publishedAt` || key === `updatedAt`
            ? ({ ...obj, [key]: new Date(data[columnTitleList[dataFormat[key]]]) })
            : ({ ...obj, [key]: data[columnTitleList[dataFormat[key]]] })
        )
        : ({ ...obj, [key]: dataFormat[key] }),
      {}
    )
}

const xlsxToJson = async () => {
  const resData = {}

  const result1 = await convertXlsxWorksheetToJson(config.xlsxPath1, config.xlsxSheetname)
  if (!result1) return
  const result2 = await convertXlsxWorksheetToJson(config.xlsxPath2, config.xlsxSheetname)
  if (!result2) return
  const result3 = await convertXlsxWorksheetToJson(config.xlsxPath3, config.xlsxSheetname)
  if (!result3) return
  const result4 = await convertXlsxWorksheetToJson(config.xlsxPath4, config.xlsxSheetname)
  if (!result4) return

  const _xlsxToJson = async (result) => {
    for (let i = 0; i < result.dataList.length; i++) {
      const data = result.dataList[i]
      const user = getData(result.info.columnTitleList, config.userDataFormat, data)
      const album = getData(result.info.columnTitleList, config.albumDataFormat, data)
      const song = getData(result.info.columnTitleList, config.songDataFormat, data)

      if (!resData[user.name]) {
        resData[user.name] = { ...user, }
      }

      if (!resData[user.name][album.name]) {
        resData[user.name][album.name] = { ...album, }
      }

      if (!resData[user.name][album.name][song.name]) {
        resData[user.name][album.name][song.name] = { ...song, }
      }
      else {
        __printError(`[xlsxToJson][_xlsxToJson] duplicated data \n\t [userId=${user.mid}, user='${user.name}', albumId=${album.mid}, album='${album.name}', songId=${song.mid}, song='${song.name}'] \n\t [userId=${resData[user.name].mid}, user='${resData[user.name].name}', albumId=${resData[user.name][album.name].mid}, album='${resData[user.name][album.name].name}', songId=${resData[user.name][album.name][song.name].mid}, song='${resData[user.name][album.name][song.name].name}']`)
      }
    }
  }

  await _xlsxToJson(result1)
  await _xlsxToJson(result2)
  await _xlsxToJson(result3)
  await _xlsxToJson(result4)

  return resData
}

const compare = async () => {
  let originalAudioFileCount = 0
  let originalImageFileCount = 0
  await filecallback(config.fileHomedir, (_path) => {
    const extname = path.extname(_path)
    if (extname === '.mp3') {
      originalAudioFileCount++
    }
    else if (extname === '.jpg') {
      originalImageFileCount++
    }

    return true
  })

  let outAudioFileCount = 0
  let outImageFileCount = 0
  await filecallback(config.fileOutHomedir, (_path) => {
    const extname = path.extname(_path)
    if (extname === '.mp3') {
      outAudioFileCount++
    }
    else if (extname === '.jpg') {
      outImageFileCount++
    }

    return true
  })

  __printLog(`[compare] originalAudioFileCount=${originalAudioFileCount}, originalImageFileCount=${originalImageFileCount}, outAudioFileCount=${outAudioFileCount}, outImageFileCount=${outImageFileCount}`)
}

const run = async () => {

  const json = await xlsxToJson()

  let outHomeDir = config.fileOutHomedir
  let _outHomeDir = outHomeDir
  let i = 0
  for (; i < 1024; i++) {
    if (fs.existsSync(_outHomeDir)) {
      _outHomeDir = `${outHomeDir}_${i}`
    }
    else {
      outHomeDir = _outHomeDir
      break;
    }
  }
  if (!(i < 1024)) {
    __printError('duplicated output path. change the config.fileOutHomeDir')
    return
  }


  await filecallback(config.fileHomedir, (_path) => {
    const extname = path.extname(_path)

    if (extname === config.audioExt) {
      const user = path.basename(path.dirname(path.dirname(_path)))
      const album = path.basename(path.dirname(_path))
      const filename = path.basename(_path)
      const song = filename.substring(0, filename.length - config.audioExt.length)

      if (json && json[user] && json[user][album] && json[user][album][song]) {
        copyFile(_path, path.join(outHomeDir, json[user].mid, json[user][album].mid, json[user][album][song].mid + config.audioExt))
        __printLog(`[run][${config.audioExt}] user='${user}', album='${album}', song='${song}', filename='${filename}'`)
      }
      else {
        const subpath = _path.substring(config.fileHomedir.length)
        copyFile(_path, outHomeDir + subpath)
        __printError(`[run][${config.audioExt}] not found data user='${user}', album='${album}', song='${song}', filename='${filename}'`)
      }
    }
    else if (extname === config.imageExt) {
      const user = path.basename(path.dirname(path.dirname(_path)))
      const album = path.basename(path.dirname(_path))
      const filename = path.basename(_path)
      const _album = filename.substring(0, filename.length - config.imageExt.length)

      if (json && json[user] && json[user][album] && json[user][_album]) {
        copyFile(_path, path.join(outHomeDir, json[user].mid, json[user][album].mid, json[user][_album].mid + config.imageExt))
        __printLog(`[run][${config.imageExt}] user='${user}', album='${album}', _album='${_album}', filename='${filename}'`)
      }
      else {
        const subpath = _path.substring(config.fileHomedir.length)
        copyFile(_path, outHomeDir + subpath)
        __printError(`[run][${config.imageExt}] not found data user='${user}', album='${album}', _album='${_album}', filename='${filename}'`)
      }
    }
    else if (extname === config.xlsxExt) {
      const user = path.basename(path.dirname(_path))
      const filename = path.basename(_path)
      const _user = filename.substring(0, filename.length - config.xlsxExt.length)

      if (json && json[user] && json[_user]) {
        copyFile(_path, path.join(outHomeDir, json[user].mid, json[_user].mid + '_data.xlsx'))
        __printLog(`[run][${config.xlsxExt}] user='${user}', _user='${_user}', filename='${filename}'`)
      }
      else {
        const subpath = _path.substring(config.fileHomedir.length)
        copyFile(_path, outHomeDir + subpath)
        __printError(`[run][${config.xlsxExt}] not found data user='${user}', _user='${_user}', filename='${filename}'`)
      }
    }

    return true
  })

  compare()
}

run()


const XLSX = require('xlsx')

const IS_DEV = process.env.NODE_ENV === 'dev'

const convertXlsxWorksheetToJson = async function (xlsxPath, worksheetName, isExistTitleRow = true, isSyncThreading = true) {
  if (!xlsxPath || !worksheetName) return

  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  try {
    /**
     * fortune xlsx to database
     */
    _printLog(`[convertXlsxWorksheetToJson] start to read xlsx file. xlsxPath=${xlsxPath}, worksheetName=${worksheetName}`)
    let startTime = new Date().getTime()
    const workbook = XLSX.readFile(xlsxPath, {})
    _printLog(`[convertXlsxWorksheetToJson] end reading xlsx file. ms=${new Date().getTime() - startTime}`)

    _printLog(`[convertXlsxWorksheetToJson] start to convert xlsx worksheet to json. xlsxPath=${xlsxPath}, worksheetName=${worksheetName}`)
    const worksheet = workbook.Sheets[worksheetName]
    if (!worksheet) {
      _printError(`[convertXlsxWorksheetToJson] xlsxPath=${xlsxPath}, worksheetName=${worksheetName} not found`)
      return false
    }

    var range = XLSX.utils.decode_range(worksheet['!ref'])

    let rowStartIdx = range.s.r
    let rowEndIdx = range.e.r
    let columnStartIdx = range.s.c
    let columnEndIdx = range.e.c

    const rowLength = rowEndIdx - rowStartIdx + 1
    const columnLength = columnEndIdx - columnStartIdx + 1

    const columnTitleList = []
    if (isExistTitleRow) {
      for (let columnIdx = columnStartIdx; columnIdx < columnLength; columnIdx++) {
        const columnTitleCell = worksheet[XLSX.utils.encode_cell({ r: rowStartIdx, c: columnIdx })]
        const columnTitleCellValue = `${columnIdx - columnStartIdx}_${columnTitleCell && columnTitleCell['w'] || ''}`
        if (columnTitleCellValue) {
          columnTitleList.push(columnTitleCellValue)
        }
      }
      rowStartIdx++
    }
    else {
      for (let columnIdx = columnStartIdx; columnIdx < columnLength; columnIdx++) {
        const columnTitle = columnTitle || `${columnIdx - columnStartIdx}`
        if (columnTitle) {
          columnTitleList.push(columnTitle)
        }
      }
    }

    let _debugLineCount = 0
    const _convertXlsxWorksheetToJson = async (syncThreadIdx, worksheet, columnTitleList, rowStartIdx, rowEndIdx, columnStartIdx, columnEndIdx) => {
      if (!worksheet || isNaN(parseInt(syncThreadIdx))) return
      if (!rowStartIdx) { rowStartIdx = 0 }
      if (!rowEndIdx) { rowEndIdx = 0 }
      if (!columnStartIdx) { columnStartIdx = 0 }
      if (!columnEndIdx) { columnEndIdx = 0 }

      const rowLength = rowEndIdx - rowStartIdx + 1
      const columnLength = columnEndIdx - columnStartIdx + 1

      try {
        const _debugLinePosition = _debugLineCount++
        const _debugLogString = `[convertXlsxWorksheetToJson] [_convertXlsxWorksheetToJson] syncThreadIdx=${syncThreadIdx} progress `
        if (IS_DEV) {
          let str = `${_debugLogString} 0%\n`
          process.stdout.write(str)
        }
        else {
          __printLog(`${_debugLogString} rowStartIdx=${rowStartIdx}, rowEndIdx=${rowEndIdx}, rowLength=${rowLength}, columnStartIdx=${columnStartIdx}, columnEndIdx=${columnEndIdx}, columnLength=${columnLength}`)
        }

        const dataList = [];

        for (let rowIdx = rowStartIdx; rowIdx < rowStartIdx + rowLength; rowIdx++) {
          const row = {}
          for (let columnIdx = columnStartIdx, columnTitleIdx = 0; columnIdx < columnLength; columnIdx++ , columnTitleIdx++) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: rowIdx, c: columnIdx })]
            const cellValue = cell && cell['w']
            if (cellValue) { row[columnTitleList[columnTitleIdx]] = cellValue }
          }
          if (Object.keys(row).length > 0) { dataList.push(row) }

          if (IS_DEV && rowIdx % 100 === 0) {
            let str = `${_debugLogString} ${Math.ceil((rowIdx - rowStartIdx) / rowLength * 100)}%`
            for (let i = 0; i < _debugLineCount - _debugLinePosition; i++) str += '\n'

            process.stdout.moveCursor(0, _debugLinePosition - _debugLineCount);
            process.stdout.clearLine();
            process.stdout.write(str)
          }
        }

        if (IS_DEV) {
          let str = `${_debugLogString} 100% complete`
          for (let i = 0; i < _debugLineCount - _debugLinePosition; i++) str += '\n'

          process.stdout.moveCursor(0, _debugLinePosition - _debugLineCount);
          process.stdout.clearLine();
          process.stdout.write(str)
        }

        return dataList
      }
      catch (error) {
        _printError(`[convertXlsxWorksheetToJson] [_convertXlsxWorksheetToJson] syncThreadIdx=${syncThreadIdx} error`, error)
        return false
      }
    }

    const SYNC_THREAD_COUNT = isSyncThreading && require('os').cpus().length || 1
    const length = Math.ceil(rowLength / SYNC_THREAD_COUNT)
    const resultList = []

    for (let syncThreadIdx = 0; syncThreadIdx < SYNC_THREAD_COUNT; syncThreadIdx++) {
      const _rowStartIdx = rowStartIdx + syncThreadIdx * length
      const _rowEndIdx = _rowStartIdx + length - 1 > rowEndIdx ? rowEndIdx : _rowStartIdx + length - 1
      resultList.push(_convertXlsxWorksheetToJson(syncThreadIdx, worksheet, columnTitleList, _rowStartIdx, _rowEndIdx, columnStartIdx, columnEndIdx))
    }
    const _resultList = await Promise.all(resultList)

    const dataList = []
    if (_resultList) {
      for (let syncThreadIdx = 0; syncThreadIdx < _resultList.length; syncThreadIdx++) {
        if (_resultList[syncThreadIdx] && Array.isArray(_resultList[syncThreadIdx])) {
          dataList.push(..._resultList[syncThreadIdx])
        }
        else {
          _printError(`[convertXlsxWorksheetToJson] id=${syncThreadIdx} error`, error)
        }
      }
    }

    _printLog(`[convertXlsxWorksheetToJson] end. ms=${new Date().getTime() - startTime}, columnLength=${columnTitleList.length}, rowLength=${dataList.length}`)

    return { info: { columnTitleList }, dataList }
  }
  catch (error) {
    _printError(`[convertXlsxWorksheetToJson] error`, error)
  }
}

const convertXlsxFileListToJson = async function (xlsxConfigList, isExistTitleRow = true) {
  const _printLog = global.__printLog || console.log
  const _printError = global.__printError || console.log

  if (!Array.isArray(xlsxConfigList)) return
  let argvValidation = xlsxConfigList.reduce((ret, xlsxConfig) => ret && xlsxConfig && xlsxConfig.path && xlsxConfig.sheetname, true)
  if (!argvValidation) return

  const resultList = await Promise.all(xlsxConfigList.map(xlsxConfig => convertXlsxWorksheetToJson(xlsxConfig.path, xlsxConfig.sheetname, isExistTitleRow)))

  let result = null
  for (let i = 0; i < resultList.length; i++) {
    const _result = resultList[i]

    if (!result) {
      result = _result
    }
    else {
      const isVal = result.info.columnTitleList.reduce((ret, elem, index) => ret && elem && _result.info.columnTitleList[index] && elem === _result.info.columnTitleList[index], true)
      if (!isVal) {
        _printError(`[convertXlsxFileListToJson] column title is diff idx1=${0}, idx2=${i}, column1=${result.info.columnTitleList && JSON.stringify(result.info.columnTitleList) || ''}, column2=${_result.info.columnTitleList && JSON.stringify(_result.info.columnTitleList) || ''}`)
        return
      }

      result.dataList.push(..._result.dataList)
    }

  }

  return result
}

module.exports = {
  convertXlsxWorksheetToJson,
  convertXlsxFileListToJson,
}

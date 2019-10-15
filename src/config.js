
const path = require(`path`)
const dataHome = path.join(__dirname, '..', 'data', 'file')
const outHome = path.join(__dirname, '..', 'out', 'file')

const xlsxHome = path.join(__dirname, '..', 'data', 'xlsx')

const config = {
  convertColumnTitle: {
    artistCode: `artistCode`,
    artistId: `artistId`,
    artistName: `artistName`,
    artistEnName: `artistEnName`,
    albumNumber: `albumNumber`,
    albumType: `albumType`,
    albumTitle: `albumTitle`,
    albumId: `albumId`,
    publish: `publish`,
    artist: `artist`,
    albumGenre: `albumGenre`,
    publisher: `publisher`,
    distributer: `distributer`,
    albumGrade: `albumGrade`,
    albumGraderPeople: `albumGraderPeople`,
    songNumber: `songNumber`,
    songId: `songId`,
    songLikeCount: `songLikeCount`,
    songTitle: `songTitle`,
    lyric: `lyric`,
    songGenre: `songGenre`,
    songWriter: `songWriter`,
    lyricist: `lyricist`,
    arranger: `arranger`,
    melonLink: `melonLink`,
    imageUrl: `imageUrl`,
  },
  xlsxConfigList: [
    { path: path.join(xlsxHome, `new_trackList_01.xlsx`), sheetname: `Sheet 1` },
    { path: path.join(xlsxHome, `new_trackList_02.xlsx`), sheetname: `Sheet 1` },
    { path: path.join(xlsxHome, `new_trackList_03.xlsx`), sheetname: `Sheet 1` },
    { path: path.join(xlsxHome, `new_trackList_04.xlsx`), sheetname: `Sheet 1` },
  ],
  xlsxExt: '.xlsx',
  fileHomedir: dataHome,
  fileOutHomedir: outHome,
  audioExt: `.mp3`,
  imageExt: `.jpg`,
  syncThreadCount: 1,

  userDataFormat: {
    mid: 1,
    name: 2,
  },
  albumDataFormat: {
    mid: 7,
    name: 6,
  },
  songDataFormat: {
    mid: 16,
    name: 18,
  },
}

module.exports = { config }

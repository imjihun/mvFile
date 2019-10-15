
const path = require(`path`)
const dataHome = '/Users/jihunlim/Desktop/git/utils/mvDir/data/file'
const outHome = '/Users/jihunlim/Desktop/git/utils/mvDir/out/file'

const xlsxHome = '/Users/jihunlim/Desktop/git/utils/mvDir/data/xlsx'

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
  xlsxPath1: path.join(xlsxHome, `new_trackList_01.xlsx`),
  xlsxPath2: path.join(xlsxHome, `new_trackList_02.xlsx`),
  xlsxPath3: path.join(xlsxHome, `new_trackList_03.xlsx`),
  xlsxPath4: path.join(xlsxHome, `new_trackList_04.xlsx`),
  xlsxExt: '.xlsx',
  xlsxSheetname: `Sheet 1`,
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

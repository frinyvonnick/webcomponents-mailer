const window = require('electron-window')

const path = require('path')

const debug = /--debug/.test(process.argv.join(' '))

const createWindow = ({ file, data, dimensions }) => {
  const win = window.createWindow(Object.assign({}, { width: 1000, height: 800 }, dimensions))
  const someArgs = Object.assign({}, data, { isDebug: debug })
  const indexPath = file

  win.showUrl(indexPath, someArgs)

  if (debug) {
    const { client } = require('electron-connect')
    client.create(win)
  }

  return win
}

exports.createMainWindow = () => {
  return createWindow({
    file: path.resolve(__dirname, '..', 'windows', 'index.html'),
    dimensions: { width: 1000, height: 800 },
  })
}

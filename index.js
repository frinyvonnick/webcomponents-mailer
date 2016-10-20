const { app, ipcMain } = require('electron')
const { createMainWindow } = require('./main-process/windows')
const path = require('path')
const glob = require('glob')
const { getMails } = require('./main-process/mails')

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')()

// prevent window being garbage collected
let mainWindow

const init = () => {
  mainWindow = createMainWindow()
  getMails(0, 45, mails => {
    mainWindow.webContents.send('mails', mails)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!mainWindow) {
    init()
  }
})

app.on('ready', () => {
  init()
})

ipcMain.on('mails', (e, index) => {
  getMails(index, 9, mails => {
    mainWindow.webContents.send('mails', mails)
  })
})

// Load scripts of main process
glob.sync(path.join(__dirname, 'main-process/**/*.js')).forEach(file => {
  require(file)
})

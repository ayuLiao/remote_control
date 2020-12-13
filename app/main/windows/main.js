const {BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let win

function create() {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (isDev) {
        win.loadURL('http://localhost:3000')
    } else {
        win.loadFile(path.resolve(__dirname, '../../rennderer/pages/main/index.js'))
    } 
}

function send(channel, ...args) {
    // 主进程
    win.webContents.send(channel, ...args)
}

module.exports = {create, send}
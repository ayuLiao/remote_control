const {BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let win
let willQuitApp = false

function create() {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.on('close', (e) => {
        if (willQuitApp) {
            wil = null
        } else {
            e.preventDefault()
            // 假关闭，点击关闭时，隐藏窗口
            win.hide()
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

function show() {
    win.show()
}

function close() {

}


module.exports = {create, send, show, close}
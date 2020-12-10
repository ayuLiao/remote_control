const {app, BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let win

app.on('ready', () => {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })
    if (isDev) {
        // 开发环境
        win.loadURL('http://localhost:3000')
    } else {
        // path.resolve()会把一个路径或路径片段的序列解析为一个绝对路径
        // __dirname 当前文件的目录名
        // 我们的项目，会将最终的html页面打包生成在pages/main下
        win.loadFile(path.resolve(__dirname, '../renderer/pages/main/index.html'))
    }
})
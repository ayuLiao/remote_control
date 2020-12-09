const {app, BrowserWindow} = require('electron')

let win

app.on('ready', () => {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadURL('http://localhost:3000')
})
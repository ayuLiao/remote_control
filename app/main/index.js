const {app} = require('electron')
const {create: createMainWindow} = require('./windows/main')
const handleIPC = require('./ipc')

app.on('ready', () => {
    createMainWindow()
    handleIPC() // 处理ipc
})
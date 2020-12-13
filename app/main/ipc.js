const {ipcMain} = require('electron')
const {create: createControlWindow} = require('./windows/control')
const {send: sendMainWindow} = require('./windows/main')

module.exports = function () {
    ipcMain.handle('login', async () => {
        // 先Mock，返回远程控制码
        let code = Math.floor(Math.random()*(999999-100000)) + 100000;
        return code
    })

    ipcMain.on('control', async (e, remoteCode) => {
        // 出单控制窗口
        createControlWindow()
        console.log(`ipc.js ${remoteCode}`)
        sendMainWindow('control-state-change', remoteCode, 1)
    })
    
}

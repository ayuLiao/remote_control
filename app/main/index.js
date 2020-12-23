const {app} = require('electron')
const {create: createMainWindow, show: showMainWindow, close: closeMainWindow} = require('./windows/main')
const {create: createControlWindow} = require('./windows/control')
const handleIPC = require('./ipc')
const {myRobot} = require('./robot')

const gotTheLock = app.requestSingleInstanceLock() //实现单实例程序（防多开）

if (!gotTheLock) {
    app.quit()
} else {
    // 再次打开程序时，因为有防多开逻辑，第二个程序会退出，直接显示已有程序的主窗口
    app.on('second-instance', () => {
        showMainWindow()
    })

    app.on('ready', () => {
        // console.log('versions info:', process)
        // createControlWindow()
        createMainWindow()
        handleIPC() // 处理ipc
        myRobot()
    })
    // 退出前钩子
    app.on('before-quit', () => {
        closeMainWindow()
    })
    app.on('activate', () => {
        showMainWindow()
    })
}


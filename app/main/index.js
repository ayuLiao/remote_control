const {app} = require('electron')
const {create: createMainWindow} = require('./windows/main')
const {create: createControlWindow} = require('./windows/control')
const handleIPC = require('./ipc')
const {myRobot} = require('./robot')

app.on('ready', () => {
    console.log('versions info:', process)
    // createControlWindow()
    createMainWindow()
    handleIPC() // 处理ipc
    myRobot()
})
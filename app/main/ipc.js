const {ipcMain} = require('electron')
const {create: createControlWindow, send: sendControlWindow} = require('./windows/control')
const {send: sendMainWindow} = require('./windows/main')
const signal = require('./signal')

module.exports = function () {
    ipcMain.handle('login', async () => {
        // 从信令服务中获取code
        let {code} = await signal.invoke('login', null, 'logined')
        return code
    })

    ipcMain.on('control', async (e, remote) => {
        // 向信令服务发送控制指令
        signal.send('control', {remote})
    })
    // 监听事件队列
    signal.on('controlled', (data) => {
        // 通知渲染进程，让页面内容发生改变
        sendMainWindow('control-state-change', data.remote, 1)
        createControlWindow()
    })

    signal.on('be-controlled', (data) => {
        sendMainWindow('control-state-change', data.remote, 2)
    })
    // 控制端与傀儡端共享的信道，就是转发
    ipcMain.on('forward', (e, event, data) => {
        signal.send('forward', {event, data})
    })
    // 傀儡对收到控制端offer SDP，转发给主窗口
    signal.on('offer', (data) => {
        sendMainWindow('offer', data)
    })

    // 控制端收到傀儡端answer，转发给控制窗口
    signal.on('answer', (data) => {
        sendControlWindow('answer', data)
    })

    // 收到傀儡端的candidate，转发给控制端的控制窗口
    signal.on('puppet-candidate', (data) => {
        sendControlWindow('candidate', data)
    })
    
    // 收到控制端的candidate，则转发给傀儡端的主窗口
    signal.on('control-candidate', (data) => {
        sendMainWindow('candidate', data)
    })

    
}

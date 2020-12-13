const {ipcMain} = require('electron')
const robot = require('robotjs')
const vkey  = require('vkey')
const ipc = require('./ipc')

function handleMouse(data) {
    // data {clientX, clientY, screen: {widhth, height}, video: {widht, height}}
    let {clientX, clientY, screen, video} = data
    // 视频与被控制窗口等比例缩放，这样鼠标才能点击到正确的位置
    let x = clientX * screen.width / video.width
    let y = clientY * screen.height / video.height
    robot.moveMouse(x, y)
    robot.mouseClick()
}

function handleKey(data) {
    // data {keyCode, meta, alt, ctrl, shift}
    const modifiers = []
    if (data.meta) modifiers.push('meta')
    if (data.shift) modifiers.push('shift')
    if (data.alt) modifiers.push('alt')
    if (data.ctrl) modifiers.push('ctrl')
    // keycode转key name
    let key = vkey[data.keyCode].toLowerCase()
    if (key[0] !== '<') { // <shift>
        robot.keyTap(key, modifiers)
    }
}

function myRobot() {
    ipcMain.on('robot', (e, type, data) => {
        if (type === 'mouse') {
            // 控制鼠标
            handleMouse(data)
        } else if (type === 'key') {
            // 控制键盘
            handleKey(data)
        }
    })
}

module.exports = {myRobot}
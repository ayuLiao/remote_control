const { app, Menu, Tray  } = require('electron')
const path = require('path')
const {show: showMainWindow} = require('../windows/main')
const {create: createAboutWindow}= require('../windows/about')

let tray = null

function setTray() {
    tray = new Tray(path.resolve(__dirname, '../icon/icon_win32.png'))
    const contextMenu = Menu.buildFromTemplate([
        { label: '打开' + app.name, click: showMainWindow},
        { label: '关于' + app.name, click: createAboutWindow},
        { type: 'separator' },
        { label: '退出', click: () => {app.quit()}}
    ])
    tray.setContextMenu(contextMenu)
    menu = Menu.buildFromTemplate([]) // 菜单栏置空，为了美观
    app.applicationMenu = menu;
}

function setAppMenu() {
    
}

module.exports = {setTray, setAppMenu}
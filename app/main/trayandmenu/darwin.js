const {app, Menu, Tray} = require('electron')
const {show: showMainWindow} = require('../windows/main')
const {create: createAboutWindow} = require('../windows/about')
const path = require('path')

// 问题：托盘出现一会，会消失...
let tray = null
// 设置托盘
function setTray() {
    let icon_path = path.resolve(__dirname, '../icon/icon_darwin.png')
    console.log('icon path:', icon_path)
    tray = new Tray(icon_path)
    // 托盘被点击时，显示主窗口
    tray.on('click', () => {
        showMainWindow()
    })
    // 托盘被右击，显示菜单，菜单里只有「显示」和「退出」按钮
    tray.on('right-click', () => {
        // 定义菜单
        const contextMenu = Menu.buildFromTemplate([
            {label: '显示', click: showMainWindow},
            {label: '退出', click: app.quit}
        ])
        // 弹出菜单
        tray.setContextMenu(contextMenu)
    })
}

// 设置菜单
function setAppMenu() {
    let appMenu = Menu.buildFromTemplate([
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow
                },
                { type: 'separator'  }, // 分割线
                { role: 'services'  },
                { type: 'separator'  },
                { role: 'hide'  },
                { role: 'hideothers'  },
                { role: 'unhide'  },
                { type: 'separator'  },
                { role: 'quit'  }
            ]
        },
        { role: 'fileMenu' }, // 文件菜单，这样我们才可以使用command+w之类的快捷键
            { role: 'windowMenu' }, // 让应用支持窗口切换的快捷键
            { role: 'editMenu' } // 让应用支持command+c / command+v
    ])
    app.applicationMenu = appMenu
}

module.exports = {setTray, setAppMenu}

// // 应用准备好后，因为使用这个形式，托盘会消失，所以不再使用这种方式
// app.whenReady().then(() => {
//     // setTray()
//     setAppMenu()
// })
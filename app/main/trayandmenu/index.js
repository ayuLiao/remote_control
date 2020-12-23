if (process.platform === 'darwin') {
    // MacOS
    const {setTray, setAppMenu} =require('./darwin')
} else if (process.platform === 'win32') {
    // windows
    require('./win32')
} else {
    // Linux不处理
}

module.exports = {setTray, setAppMenu}
const openAboutWindow = require('about-window').default
const path = require('path')

const create = () => openAboutWindow({
    icon_path: path.join(__dirname, 'icon.png'), // 软件图标
    package_json_dir: path.resolve(__dirname, '/../../../'), // package.json文件所在目录
    cropyright: 'Copyright (c) 2020 ayuliao', // 版权信息
    homepage: 'https://github.com/ayuliao/remote_control', // 点击图标，进行调转
})

module.exports = {create}


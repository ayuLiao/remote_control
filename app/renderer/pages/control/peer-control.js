const EventEmitter = require('events')
const peer = new EventEmitter()
const {ipcRenderer, desktopCapturer} = require('electron')

async function getScreenStream() {
    // 用于从桌面上捕获音频和视频的媒体源信息
    const sources = await desktopCapturer.getSources({types:['screen']})
    // 获得媒体流对象
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            mandatory: {
                // 指定为桌面类型
                chromeMediaSource: 'desktop',
                // 指定屏幕，如果有外接屏幕，则可以指定为大于0的下标
                chromeMediaSourceId: sources[0].id,
                maxWidth: window.screen.width,
                maxHeight: window.screen.height
            }
        } 
    }).then(stream => {
        // 推送事件到事件队列中
        peer.emit('add-stream', stream)
    }).catch(err => {
        // handle err
        console.error(err)
    })

}

getScreenStream()

peer.on('robot', (type, data) => {
    if (type === 'mouse') {
        data.screen = {
            width: window.screen.width, 
            height: window.screen.height
        }
    }

    // 方便测试
    setTimeout(() => {
        ipcRenderer.send('robot', type, data)
    }, 2000)

    // ipcRenderer.send('robot', type, data)
})

module.exports = peer
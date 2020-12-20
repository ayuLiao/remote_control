const EventEmitter = require('events')
const peer = new EventEmitter()
const {ipcRenderer, desktopCapturer} = require('electron')
const { off } = require('process')

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

// getScreenStream()


const pc = new window.RTCPeerConnection({})

// RTCPeerConnection方法调用后，onicecandidate方法会被自动调用
pc.onicecandidate = function(e) {
    console.log('candidate', JSON.stringify(e.candidate))
}
// 它需要等到pc.remoteDescription生效后，addIceCandidate方法添加candidate才会有效
// 所以，在添加candidate时，先将他缓存起来，等pc.remoteDescription生效后，再一次性将缓存里的candidate添加上
let candidates = []
async function addIceCandidate(candidate) {
    if (candidate) {
        candidates.push(candidate)
    }
    if (pc.remoteDescription && pc.remoteDescription.type) {
        for (let i = 0; i < candidates.length; i++) {
            await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
        }
        // 添加完后，缓存置空
        candidates = []
    }
}

// 方便演示
window.addIceCandidate = addIceCandidate

async function createOffer() {
    // 创建offer SDP
    const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    })
    // 设置SDP
    await pc.setLocalDescription(offer)
    console.log('pc offer', JSON.stringify(offer))
    return pc.localDescription
} 
createOffer()

// 远程设置SDP
async function setRemote(answer) {
    await pc.setRemoteDescription(answer)
    console.log('create-answer', pc)
}

// 将方法挂载到全局，方便演示（直接通过控制台复制代码的形式在控制端和傀儡端传输信息）
window.setRemote = setRemote

// 当调用RTCPeerConnection.setRemoteDescription()方法时，这个事件就会被立即触发，它不会等待SDP协商的结果。
pc.onaddstream = function(e) {
    console.log('add-stream', e)
    peer.emit('add-stream', e.stream)
}



// peer.on('robot', (type, data) => {
//     if (type === 'mouse') {
//         data.screen = {
//             width: window.screen.width, 
//             height: window.screen.height
//         }
//     }

//     // 方便测试
//     setTimeout(() => {
//         ipcRenderer.send('robot', type, data)
//     }, 2000)

//     // ipcRenderer.send('robot', type, data)
// })

module.exports = peer
const EventEmitter = require('events')
const peer = new EventEmitter()
const {ipcRenderer, desktopCapturer} = require('electron')
const pc = new window.RTCPeerConnection({})

// reliable: false 不要求数据是必须可达的，即允许一定的丢失
const dc = pc.createDataChannel('robotchannel', {reliable: false})
// 建立成功
dc.onopen = function() {
    peer.on('robot', (type, data) => {
        dc.send(JSON.stringify({type, data}))
    })
}
// 接收消息
dc.onmessage = function(event) {
    console.log('message', event)
}
// 收到错误
dc.onerror = (e) => {
    console.log('error', e)
}

// RTCPeerConnection方法调用后，onicecandidate方法会被自动调用
pc.onicecandidate = function(e) {
    console.log('candidate', e.candidate)
    if (e.candidate) {
        ipcRenderer.send('forward', 'control-candidate', JSON.stringify(e.candidate))
    }
}
// 它需要等到pc.remoteDescription生效后，addIceCandidate方法添加candidate才会有效
// 所以，在添加candidate时，先将他缓存起来，等pc.remoteDescription生效后，再一次性将缓存里的candidate添加上
let candidates = []
async function addIceCandidate(candidate) {
    if (candidate) {
        candidates.push(JSON.parse(candidate))
    }
    if (pc.remoteDescription && pc.remoteDescription.type) {
        for (let i = 0; i < candidates.length; i++) {
            await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
        }
        // 添加完后，缓存置空
        candidates = []
    }
}


async function createOffer() {
    console.log('createOffer running')
    // 创建offer SDP
    let offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    })
    // 设置SDP
    await pc.setLocalDescription(offer)
    // console.log('pc offer', JSON.stringify(offer))
    return pc.localDescription
} 

// 远程设置SDP
async function setRemote(answer) {
    await pc.setRemoteDescription(answer)
    // console.log('create-answer', pc)
}


// createOffer创建offer SDP返回的pc.localDescription是一个Promise
// 通过then方法，将成功创建的offer SDP发送到ipcMain中。
// forward类型，其实就是让信令服务做转发。
createOffer().then((offer) => {
    // console.log('forward', 'create offer', offer)
    console.log('forward', 'createOffer')
    ipcRenderer.send('forward', 'offer', {type: offer.type, sdp: offer.sdp})
}).catch(() => {
    console.log('forward create offer Error')
})

// ipcMain发送answer消息，则将answer通过setRemote设置上
ipcRenderer.on('answer', (e, answer) => {
    setRemote(answer)
})

ipcRenderer.on('candidate', (e, candidate) => {
    addIceCandidate(candidate)
})

window.addIceCandidate = addIceCandidate


// 当调用RTCPeerConnection.setRemoteDescription()方法时，这个事件就会被立即触发，它不会等待SDP协商的结果。
pc.onaddstream = function(e) {
    // console.log('add-stream', e)
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
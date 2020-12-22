const {desktopCapturer, ipcRenderer} = window.require('electron')

async function getScreenStream() {
    // 用于从桌面上捕获音频和视频的媒体源信息
    const sources = await desktopCapturer.getSources({types:['screen']})
    // 获得媒体流对象
    return navigator.mediaDevices.getUserMedia({
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
    })
}


const pc = new window.RTCPeerConnection({});

// 接受控制端传输的robot指令
pc.ondatachannel = (e) => {
    console.log('data', e)
    e.channel.onmessage = (e) => {
        console.log('onmessage', e, JSON.parse(e.data))
        let {type, data} = JSON.parse(e.data)
        console.log('robot', type, data)
        if (type === 'mouse') {
            data.screen = {
                width: window.screen.width,
                height: window.screen.height
            }
        }
        ipcRenderer.send('robot', type, data)
    }
}

// RTCPeerConnection方法调用后，onicecandidate方法会被自动调用
pc.onicecandidate = function(e) {
    // console.log('candidate', JSON.stringify(e.candidate))
    console.log('candidate', e.candidate)
    if (e.candidate){ // candidate 不为null
        ipcRenderer.send('forward', 'puppet-candidate', JSON.stringify(e.candidate))
    }
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
            try{
                await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
            } catch (e) {
                console.log(e)
            }
        }
        // 添加完后，缓存置空
        candidates = []
    }
}

ipcRenderer.on('candidate', (e, candidate) => {
    addIceCandidate(candidate)
})

// 获得远程传递的offer SDP
async function createAnswer(offer) {
    let stream = await getScreenStream()
    pc.addStream(stream)
    await pc.setRemoteDescription(offer)
    // 创建本地的SDP Answer并设置
    await pc.setLocalDescription(await pc.createAnswer())
    console.log('answer', JSON.stringify(pc.localDescription))
    return pc.localDescription
}


ipcRenderer.on('offer', async (e, offer) => {
    // console.log('forward', 'create answer', offer)
    console.log('forward', 'createAnswer offer')
    let answer = await createAnswer(offer)
    ipcRenderer.send('forward', 'answer', {type: answer.type, sdp: answer.sdp})
})
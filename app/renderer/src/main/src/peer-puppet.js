const {desktopCapturer} = window.require('electron')

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

// 挂在全局，方便测试
window.createAnswer = createAnswer
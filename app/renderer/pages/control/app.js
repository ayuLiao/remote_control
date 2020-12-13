const peer = require('./peer-control')

let video = document.getElementById('screen-video')

function play(stream) {
    video.srcObject = stream
    video.onloadedmetadata = function () {
        video.play()
    }
}

peer.on('add-stream', (stream) => {
    play(stream)
})

window.onkeydown = function(e) {
    // data {keyCode, meta, alt, ctrl, shift}
    let data = {
        keyCode: e.keyCode,
        shift: e.shiftKey,
        meta: e.metaKey,
        control: e.ctrlKey,
        alt: e.altKey
    }
    peer.emit('robot', 'key', data)
}

window.onmouseup = function(e) {
    // data {clientX, clientY, screen: {widhth, height}, video: {widht, height}}
    let data = {}
    data.clientX = e.clientX
    data.clientY = e.clientY
    data.video = {
        width: video.getBoundingClientRect().width,
        height: video.getBoundingClientRect().height
    }
    peer.emit('robot', 'mouse', data)
}
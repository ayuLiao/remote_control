const WebSocket = require('ws')
const EventEmitter = require('events')
const { resolve } = require('path')
const signal = new EventEmitter()

const ws = new WebSocket('ws://127.0.0.1:8010')

ws.on('open', function open() {
    console.log('connect success')
})

ws.on('message', function incoming(message) {
    let data = JSON.parse(message)
    // console.log('data', data, message)
    // 将从信令服务中收到的消息推送到事件队列中
    signal.emit(data.event, data.data)
})

function send(event, data) {
    // console.log('sended', JSON.stringify({event, data}))
    ws.send(JSON.stringify({event, data}))
}

// 让ipcMain可以调用invoke去发送信息
function invoke(event, data, answerEvent) {
    return new Promise((resolve, reject) => {
        // 发送信息
        send(event, data)
        // 监听指定的anserEvent，拿到结果后直接resolve，once方法只监听一次
        signal.once(answerEvent, resolve)
        // 所有的invoke都要做一个setTimeout表示超时，超时后，直接reject
        setTimeout(() => {
            reject('timeout')
        }, 5000)
    })
}

signal.send = send
signal.invoke = invoke

module.exports = signal
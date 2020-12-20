const WebSocket = require('ws')
const port = 8010
const wss = new WebSocket.Server({port: port})
const code2ws = new Map()

console.log(`webSocket server start, listening: ${port}`)

wss.on('connection', function connection(ws, request) {
    // 因为ws.send方法只能发送字符串，所以这里封装一下
    ws.sendData = (event, data) => {
        ws.send(JSON.stringify({event, data}))
    }

    ws.sendError = msg => {
        ws.sendData('error', {msg})
    }
    // 控制码
    let code =  Math.floor(Math.random()*(999999-100000)) + 100000;
    // 格式化ip
    let ip = request.connection.remoteAddress.replace('::ffff:', '')
    console.log('ip is connected', ip)

    // Map字典, key=code, value=ws
    code2ws.set(code, ws)

    ws.on('message', function incoming(message) {
        console.log('incoming message')
        let parseMessage = {}
        try {
            // json解析msg
            parseMessage = JSON.parse(message)
        } catch (e) {
            console.log('parse error', e)
            ws.sendError('message not valid')
            return
        }
        // 预定 data -> "data": {"xxx": "xxx", ...}
        let {event, data} = parseMessage

        if (event === 'login') {
            ws.sendData('logined', {code})
        } else if (event === 'control') {
            // 控制端发送傀儡端的code
            let remote = +data.remote
            if (code2ws.has(remote)) {
                // 发送给控制端「你已经控制remote」
                ws.sendData('controlled', {remote})
                // 从code2ws中获得傀儡端的ws，用于向傀儡端发送数据
                let remoteWS = code2ws.get(remote)
                // 将傀儡端本身发送数据的方法sendData作为控制端的sendRemote方法
                ws.sendRemote = remoteWS.sendData
                // 控制端发送数据的方法作为傀儡端的sendRemote方法
                remoteWS.sendRemote = ws.sendData
                // 发送给傀儡端「你已经被控制」
                ws.sendRemote('be-controlled', {remote: code})
            } else {
                ws.sendError('user not found')
            }
        } else if (event === 'forward') {
            // 转发需求，当ws.sendRemote方法设置好后，便可以直接通过sendRemote转发数据。
            ws.sendRemote(data.event, data.data)
        } else {
            ws.sendError('message not handle', message)
        }
    })

    // websocket断开时，清理数据
    ws.on('close', () => {
        // 删除映射
        code2ws.delete(code)
        // 删除sendRemote方法
        delete ws.sendRemote
        clearTimeout(ws._closeTimeout)
    })
    // 定时器，在接收到close 10分钟后，终止ws
    ws._closeTimeout = setTimeout(() => {
        ws.terminate()
    }, 600000)

})
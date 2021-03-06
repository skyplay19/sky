import 'sky/common/HakunaMatata'

declare global {
    const withIoClientSocket: typeof _.withIoClientSocket
}

namespace _ {
    export function withIoClientSocket(
        socket: Io.ClientSocket,
        cb: (scope: HakunaMatata, socket: Io.ClientSocket) => void
    ) {
        let withConnected: HakunaMatata | null = null

        const getConnected = FunctionEventEmitter(() => withConnected)

        const withSocket = withScope((scope, socket: Io.ClientSocket) => {})

        socket.on('connect', () => {
            withSocket(socket, scope => {
                withConnected = scope
                getConnected.emit('change')
                getConnected.emit('create')
                getConnected.emit('connect')
                return cb(scope, socket)
            })
        })
        socket.on('disconnect', () => {
            withConnected!.destroy()
            withConnected = null
            getConnected.emit('change')
            getConnected.emit('destroy')
            getConnected.emit('disconnect')
        })

        return getConnected
    }
}
globalify(_)

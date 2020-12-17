import * as ws from 'ws';
import * as uuid from 'uuid';
import { Server } from 'http';
import { fromPredicate, Option, none, fromNullable, some } from 'fp-ts/lib/Option';
import { MessageIO, ConnectMessage, DropMessage, WriteMessage, CitemMessage, Message, DeleteMessage } from '../lib/io';
import { createNode, createText, createSymbol, nodeToJSON, textToJSON, symbolToJSON, findLogRecord, createDelete, deleteToJSON } from './record';


const opened = fromPredicate((x: ws) => x.readyState === ws.OPEN);

export const WEBSOCKET_PORT = 3334


interface UserSession {
    id: string;
    socket: ws;
    alive: boolean;
    map: Option<string>;
}

const newSession = (
    id: string,
    socket: ws,
): UserSession => ({ id, socket, alive: true, map: none })

export const startWS = (
    server: Server,
    port: number,
    path: string,
) => {

    const wss = new ws.Server({
        path,
        server,
        port
    }, () => console.log(`Started websocket server on  http://0.0.0.0:${port}${path}`));

    let sessions: UserSession[] = [];

    const addSession = (us: UserSession) => sessions.push(us)

    const findSession = (user: string) =>
        fromNullable(sessions.find(({ id }) => id === user))

    const removeSession = (user: string) => fromNullable(sessions.findIndex(({ id }) => id === user))
        .map(index => sessions.splice(index, 1));

    const mapSession = (
        f: (u: UserSession) => UserSession
    ) => (
        user: string
    ) => fromNullable(sessions.findIndex(({ id }) => id === user))
        .map(index => sessions[index] = f(sessions[index]));


    const addFileToSession = (user: string, map: string) => mapSession((s) => ({ ...s, map: some(map) }))(user)

    const beat = setInterval(() => {
        const deadSessions = sessions.filter(s => !s.alive);
        deadSessions.forEach(s => {
            console.log(`TERMINATE> ${s.id}`)
            s.socket.terminate();
            removeSession(s.id);
        })
        sessions.forEach(s => {
            s.alive = false
            s.socket.ping()
        })

    }, 30000)


    wss.on('close', () => {
        clearInterval(beat)
        sessions.forEach(s => s.socket.terminate())
    })


    const broadcast = (
        mapName: string,
        msg: string,
    ) => sessions
        .filter(({ map }) => map
            .map(name => mapName === name)
            .getOrElse(false))
        .forEach(({ socket }) => opened(socket)
            .map(xo => xo.send(msg)));


    const onPong = (
        user: string,
    ) => () => {
        console.log(`PONG> ${user}`);
        mapSession((s) => ({ ...s, alive: true }))(user)
    }


    const onConnect = (
        { data, user }: ConnectMessage
    ) => findLogRecord(data.map)
        .map(({ name, file }) => {
            addFileToSession(user, name)
            findSession(user)
                .map(({ socket }) => {
                    file.tell().map(r => {
                        switch (r.kind) {
                            case 'node': return socket.send(JSON.stringify(nodeToJSON(r)))
                            case 'text': return socket.send(JSON.stringify(textToJSON(r)))
                            case 'symbol': return socket.send(JSON.stringify(symbolToJSON(r)))
                            case 'delete': return socket.send(JSON.stringify(deleteToJSON(r)))
                        }
                    });
                })
        })

    const onDrop = (
        { user, data }: DropMessage
    ) => findSession(user)
        .chain(({ map }) => map.chain(findLogRecord))
        .map(({ name, file }) => {
            const record = file.log(
                createNode({ x: data.x, y: data.y }, data.item, user))
            broadcast(name, JSON.stringify(nodeToJSON(record)))
            file.sync()
        })

    const onDelete = (
        { user, data }: DeleteMessage
    ) => findSession(user)
        .chain(({ map }) => map.chain(findLogRecord))
        .map(({ name, file }) => file.find((r) => r.kind === 'node' && r.session === user).map((_) => {
            const record = file.log(
                createDelete(data.node, user))
            broadcast(name, JSON.stringify(deleteToJSON(record)))
            file.sync()
        }))

    const onWrite = (
        { user, data }: WriteMessage
    ) => findSession(user)
        .chain(({ map }) => map.chain(findLogRecord))
        .map(({ name, file }) => {
            const record = file.log(
                createText(data.node, data.content, user))
            broadcast(name, JSON.stringify(textToJSON(record)))
            file.sync()
        })

    const onCitem = (
        { user, data }: CitemMessage
    ) => findSession(user)
        .chain(({ map }) => map.chain(findLogRecord))
        .map(({ name, file }) => {
            const record = file.log(
                createSymbol(data.name, data.encoded, user))
            broadcast(name, JSON.stringify(symbolToJSON(record)))
            file.sync()
        })
        .orElse(() => some(console.error('!! failed on citem')))

    const onOther = (
        msg: Message
    ) => findSession(msg.user)
        .chain(({ map }) => map)
        .map(name => broadcast(name, JSON.stringify(msg)))

    wss.on('connection', (socket, _req) => {
        const id = uuid();
        addSession(newSession(id, socket))

        socket.on('pong', onPong(id));

        socket.on('message', (msg) => {
            try {
                const Obj = JSON.parse(msg.toString());
                MessageIO.decode(Obj)
                    .map((message) => {
                        if (message.user !== id) {
                            console.log('message from another user!')
                            return
                        }
                        switch (message.type) {
                            case 'connect': return onConnect(message);
                            case 'drop': return onDrop(message);
                            case 'write': return onWrite(message);
                            case 'citem': return onCitem(message);
                            case 'delete': return onDelete(message);
                            default: return onOther(message)
                        }
                    })
            }
            catch (err) {
                console.error(err);
            }
        })

        socket.on('close', () => removeSession(id));

        socket.send(JSON.stringify({
            type: 'helo',
            user: id
        }))

    });


}

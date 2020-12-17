import { Option, some, none } from "fp-ts/lib/Option";
import { MessageType, MessageT, MessageIO, ClientConfig, HeloMessageIO } from "../lib/io";
// import * as uuid from 'uuid';
import { Tuple } from "fp-ts/lib/Tuple";
import * as debug from 'debug';
import uuid = require("uuid");

const logger = debug('ml:connection');

export type Handler<T extends MessageType> = (m: Option<MessageT<T>>) => void;


/**
 * checkScheme ensures that URL has the same scheme than the location
 * fixes Mixed Content when getting URLs from a proxied server
 * @param url
 */
const checkScheme =
    (url: string): string => {
        const lp = window.location.protocol;
        if ('http:' === lp || url.slice(0, lp.length) === lp) {
            return url; // we're on the same page
        }

        // we're asking for ws while we're on https
        return 'wss' + url.slice(2);
    };


type HandlerRec<T extends MessageType> = Tuple<T, Handler<T>>;


const applyHandler =
    <T extends MessageType>(m: MessageT<T>) =>
        (hr: HandlerRec<T>) =>
            m.type === hr.fst ?
                hr.map(h => h(some(m))) :
                hr.map(h => h(none));


interface Connect {
    subscribe: <T extends MessageType>(t: T) => (h: Handler<T>) => void;
    send: <T extends MessageType>(m: MessageT<T>) => MessageT<T>;
    user: string;
}

export const connect =
    (config: ClientConfig) => new Promise<Connect>((resolve, _reject) => {
        const ws = new WebSocket(checkScheme(config.websocket));
        const handlers: HandlerRec<MessageType>[] = [];
        let connected = false;
        ws.onclose = (ev) => {
            console.log(`[WS Closed] ${ev.code}: ${ev.reason}`)
        }
        ws.onerror = err => console.error(err);
        ws.onmessage =
            (m) => {
                try {
                    const data = JSON.parse(m.data);
                    if (connected) {
                        MessageIO.decode(data)
                            .map(msg => handlers.map(applyHandler(msg)))
                    }
                    else {
                        HeloMessageIO.decode(data)
                            .map(({ user }) => {
                                connected = true;
                                send({
                                    type: 'connect',
                                    id: uuid.v4(),
                                    user,
                                    data: {
                                        map: config.name,
                                    }
                                })
                                resolve({ subscribe, send, user });
                            })
                    }
                }
                catch (err) {
                    console.error(`data didnt deserialize [${m.data}]`)
                }
            }

        const subscribe =
            <T extends MessageType>(t: T) =>
                (h: Handler<T>) => {
                    const w: Handler<T> =
                        (a) => {
                            return h(a);
                        }
                    handlers.push(new Tuple(t, w));
                };


        const send = <T extends MessageType>(m: MessageT<T>) => {
            ws.send(JSON.stringify(m));
            return m;
        }

    });



logger('loaded');

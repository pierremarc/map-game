import { Option, some, none } from "fp-ts/lib/Option";
import { validate, MessageType, Message } from "../lib/io";
// import * as uuid from 'uuid';
import { Tuple } from "fp-ts/lib/Tuple";



export type Handler<T extends MessageType> = (m: Option<Message<T>>) => void;




type HandlerRec<T extends MessageType> = Tuple<T, Handler<T>>;


const applyHandler =
    <T extends MessageType>(m: Message<T>) =>
        (hr: HandlerRec<T>) =>
            m.type === hr.fst() ?
                hr.map(h => h(some(m))) :
                hr.map(h => h(none));



export const connect =
    (url: string) => {
        const ws = new WebSocket(url);
        const handlers: HandlerRec<MessageType>[] = [];
        ws.onerror = err => console.error(err);
        ws.onmessage =
            (m) => {
                try {
                    const data = JSON.parse(m.data);
                    validate(data)
                        .map(m => handlers.map(applyHandler(m)));
                }
                catch (err) {
                    console.error(`data didnt deserialize [${m.data}]`)
                }
            }

        const subscribe =
            <T extends MessageType>(t: T) =>
                (h: Handler<T>) => {
                    handlers.push(new Tuple([t as MessageType, h]));
                };


        const send =
            <T extends MessageType>(m: Message<T>) => {
                ws.send(JSON.stringify(m));
                return m;
            }

        return { subscribe, send };
    };
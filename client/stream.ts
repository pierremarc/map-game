
import { MessageType, Message } from "../lib/io";

export type Subscriber<A> = (e: A) => A;


export const createStream =
    <T extends MessageType>() => {
        type MT = Message<T>;
        const subs: Subscriber<MT>[] = [];

        const subscribe =
            (s: (a: MT) => MT) => {
                subs.push(s);
            };

        const feed =
            (m: MT) => subs.map(s => s(m));

        return { subscribe, feed };
    }
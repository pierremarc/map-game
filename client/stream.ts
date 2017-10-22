
import { MessageType, Message } from "../lib/io";

export type Subscriber<A> = (e: A) => A;


export interface StreamI<T extends MessageType> {
    subscribe: (s: (a: Message<T>) => Message<T>) => void;
    feed: (m: Message<T>) => Message<T>[];
}

export const createStream =
    <T extends MessageType>(): StreamI<T> => {
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

import { MessageType, Message } from "../lib/io";

export type Subscriber<A> = (e: A) => A;


export interface StreamI<T> {
    subscribe: (s: (a: T) => T) => void;
    feed: (m: T) => T[];
}


export const createStream =
    <T>(): StreamI<T> => {
        const subs: Subscriber<T>[] = [];

        const subscribe =
            (s: (a: T) => T) => {
                subs.push(s);
            };

        const feed =
            (m: T) => subs.map(s => s(m));

        return { subscribe, feed };
    }


export interface MessageStreamI<T extends MessageType> {
    subscribe: (s: (a: Message<T>) => Message<T>) => void;
    feed: (m: Message<T>) => Message<T>[];
}

export const createMessageStream =
    <T extends MessageType>() => {
        return createStream<Message<T>>();
    }
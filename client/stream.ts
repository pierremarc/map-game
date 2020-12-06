
import { MessageType, MessageT } from "../lib/io";

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
    subscribe: (s: (a: MessageT<T>) => MessageT<T>) => void;
    feed: (m: MessageT<T>) => MessageT<T>[];
}

export const createMessageStream =
    <T extends MessageType>() => {
        return createStream<MessageT<T>>();
    }
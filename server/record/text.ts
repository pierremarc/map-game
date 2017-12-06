
import { write } from 'fs';
import * as uuid from 'uuid';
import { Task } from 'fp-ts/lib/Task';
import * as io from 'io-ts';



export const TextIO = io.interface({
    kind: io.literal('text'),
    id: io.string,
    node: io.string,
    text: io.string,
    time: io.number,
    session: io.string,
}, 'Text');
export type Text = io.TypeOf<typeof TextIO>;


export const createText =
    (node: string, text: string, session: string): Text => ({
        kind: 'text',
        id: uuid(),
        time: Date.now(),
        node,
        text,
        session,
    });

const textToString =
    (text: Text) => JSON.stringify(text);


export const writeText =
    (text: Text, fd: number) =>
        new Task(() => new Promise<void>(
            (resolve, reject) => write(fd, textToString(text),
                (err, _result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                }))
        );

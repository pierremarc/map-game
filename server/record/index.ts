import { write } from 'fs';
import { Task } from 'fp-ts/lib/Task';
import * as io from 'io-ts';

import { NodeIO, Node } from './node';
import { TextIO, Text } from './text';
import { MapSymbolIO, MapSymbol } from './symbol';

export * from './node';
export * from './text';
export * from './symbol';



export interface LogRecordMap {
    'node': Node;
    'text': Text;
    'symbol': MapSymbol;
}
export type LogRecordKind = keyof LogRecordMap;

export const LogRecordIO = io.union([
    NodeIO,
    TextIO,
    MapSymbolIO,
], 'LogRecord')

export type LogRecord = io.TypeOf<typeof LogRecordIO>;

export const writeRecord =
    (o: LogRecord, fd: number) =>
        new Task(() => new Promise<void>(
            (resolve, reject) => write(fd, `${JSON.stringify(o)}\n`,
                (err, _result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                }))
        );

import { write } from 'fs';
import { Task } from 'fp-ts/lib/Task';
import * as io from 'io-ts';

import { NodeIO, Node } from './node';
import { TextIO, Text } from './text';
import { MapSymbolIO, MapSymbol } from './symbol';
import { Delete, DeleteIO } from './delete';
import { fromNullable } from 'fp-ts/lib/Option';
import { LogFile } from '../log';

export * from './node';
export * from './text';
export * from './symbol';
export * from './delete';



export interface LogRecordMap {
    'node': Node;
    'text': Text;
    'symbol': MapSymbol;
    'delete': Delete,
}
export type LogRecordKind = keyof LogRecordMap;

export const LogRecordIO = io.union([
    NodeIO,
    TextIO,
    MapSymbolIO,
    DeleteIO,
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


export const isNode = (r: LogRecord): r is Node => r.kind === 'node';
export const isText = (r: LogRecord): r is Text => r.kind === 'text';
export const isSymbol = (r: LogRecord): r is MapSymbol => r.kind === 'symbol';
export const isDelete = (r: LogRecord): r is Delete => r.kind === 'delete';


interface LogRecordItem {
    name: string;
    url: string;
    file: LogFile;
}

const records: LogRecordItem[] = [];

export const pushLogRecord = (r: LogRecordItem) => records.push(r);

export const getLogRecords = () => records.slice()

export const findLogRecord = (n: string) => fromNullable(records.find(({ name }) => n === name));

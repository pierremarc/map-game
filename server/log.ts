import * as proj4 from 'proj4';
import { existsSync, mkdirSync, open, openSync, readFileSync, closeSync } from 'fs';
import { resolve, join, sep } from 'path';
import { Task } from 'fp-ts/lib/Task';
import * as io from 'io-ts';

import { LogRecordIO, writeRecord, LogRecord, Node, isNode, isText, Position } from './record';
import { FeatureCollection, Feature } from 'geojson-iots';
import { fromNullable, Option } from 'fp-ts/lib/Option';




const ensureDir =
    (path: string) =>
        resolve(path).split(sep).slice(1).reduce((acc, d) => {
            const dirPath = join(acc, d);
            console.log(`ensureDir ${dirPath}`);
            if (!existsSync(dirPath)) {
                mkdirSync(dirPath);
            }
            return dirPath;
        }, sep)

const openFileTask =
    (path: string) => new Task(() =>
        new Promise<number>((resolve, reject) => open(path, 'a', (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        }))
    );


export interface Log {
    name: string;
}


export const createLog =
    (name: string): Log => ({
        name,
    });



export type RecordValidation = io.Validation<LogRecord>;


interface Indexed<T> {
    [key: string]: T
}



const { forward } = proj4('EPSG:3857', 'EPSG:4326');
const toLatLong = (
    p: Position
) => forward([p.x, p.y])


const nodeToFeature = (
    texts: Indexed<string>
) => (n: Node): Feature => ({
    type: 'Feature',
    id: n.id,
    geometry: {
        type: 'Point',
        coordinates: toLatLong(n.position),
    },
    properties: {
        id: n.id,
        text: texts[n.id] ?? '',
        symbol: n.symbol,
        time: n.time,
        session: n.session,
    }
})

export interface LogFile {
    tell(): Readonly<LogRecord[]>;
    log: <T extends LogRecord>(r: T) => T;
    sync(): Promise<void>;
    json(): FeatureCollection;
    find(f: (r: LogRecord) => boolean): Option<LogRecord>;
    filter(f: (r: LogRecord) => boolean): LogRecord[];
}

const validate =
    (a: any): RecordValidation => LogRecordIO.decode(a);

const readLog =
    (path: string) => {
        const records: Readonly<LogRecord>[] = [];
        let fd = -1;
        try {
            fd = openSync(path, 'r')
        }
        catch (_err) {
            fd = openSync(path, 'w')
        }
        finally {
            closeSync(fd);
        }
        try {
            readFileSync(path, { encoding: 'utf-8' })
                .split('\n')
                .map(l => {
                    console.log(l);
                    try { return JSON.parse(l); }
                    catch (_err) {
                        console.error(`Failed to parse [${l}]`)
                        return {};
                    }
                })
                .map(o => validate(o).map(r => records.push(r)));
        }
        finally {
        }

        return records;
    }




export const initLogFile =
    (rootDir: string, name: string): Task<LogFile> => {
        ensureDir(rootDir);
        const path = resolve(rootDir, name);
        const records = readLog(path);
        let op: Task<void> = new Task(() => Promise.resolve());

        const tell = () => records.slice(0);

        const find = (f: (r: LogRecord) => boolean) => fromNullable(tell().find(f));

        const filter = (f: (r: LogRecord) => boolean) => tell().filter(f);

        const sync =
            () => {
                const op_ = op;
                op = new Task(() => Promise.resolve());
                return op_.run();
            };

        const json = (): FeatureCollection => {
            const records = tell();
            const texts = records.filter(isText).reduce((acc, t) => {
                const newText = (() => {
                    if (t.node in acc) {
                        return [acc[t.node], t.text].join('\n\n');
                    }
                    return t.text;
                })();
                return ({ ...acc, [t.node]: newText })
            }, {} as Indexed<string>)
            const features = records.filter(isNode).map(nodeToFeature(texts));

            return {
                type: 'FeatureCollection',
                features
            };
        }

        return openFileTask(path).map((fd) => {
            const log =
                <T extends LogRecord>(r: T) => {
                    records.push(r);
                    op = op.chain(() => writeRecord(r, fd));
                    return r;
                };
            return { tell, log, sync, json, find, filter };
        })
    };

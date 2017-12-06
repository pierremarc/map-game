
import { existsSync, mkdirSync, open, openSync, readFileSync, closeSync } from 'fs';
import { resolve, join, sep } from 'path';
import { Task } from 'fp-ts/lib/Task';
import * as io from 'io-ts';

import { LogRecordIO, writeRecord, LogRecord } from './record';





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

export interface LogFile {
    tell(): Readonly<LogRecord[]>;
    log: <T extends LogRecord>(r: T) => T;
    sync(): Promise<void>;
}

const validate =
    (a: any): RecordValidation => io.validate(a, LogRecordIO);

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

        const tell =
            () => records.slice(0);


        const sync =
            () => {
                const op_ = op;
                op = new Task(() => Promise.resolve());
                return op_.run();
            };

        return openFileTask(path).map((fd) => {
            const log =
                <T extends LogRecord>(r: T) => {
                    records.push(r);
                    op = op.chain(() => writeRecord(r, fd));
                    return r;
                };
            return { tell, log, sync };
        })
    };


import { write } from 'fs';
import * as uuid from 'uuid';
import { Task } from 'fp-ts/lib/Task';
import * as io from 'io-ts';



export const MapSymbolIO = io.interface({
    kind: io.literal('symbol'),
    id: io.string,
    name: io.string,
    encoded: io.string,
    time: io.number,
    session: io.string,
}, 'MapSymbol');
export type MapSymbol = io.TypeOf<typeof MapSymbolIO>;


export const createSymbol =
    (name: string, encoded: string, session: string): MapSymbol => ({
        kind: 'symbol',
        id: uuid(),
        time: Date.now(),
        name,
        encoded,
        session,
    });

const symbolToString =
    (s: MapSymbol) => JSON.stringify(s);


export const writeSymbol =
    (s: MapSymbol, fd: number) =>
        new Task(() => new Promise<void>(
            (resolve, reject) => write(fd, symbolToString(s),
                (err, _result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                }))
        );

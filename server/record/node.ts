
import * as uuid from 'uuid';
import * as io from 'io-ts';


export type NodeSymbol = string;


export const PositionIO = io.interface({
    x: io.number,
    y: io.number,
}, 'Position');
export type Position = io.TypeOf<typeof PositionIO>;

export const NodeIO = io.interface({
    kind: io.literal('node'),
    id: io.string,
    position: PositionIO,
    symbol: io.string,
    time: io.number,
    session: io.string,
}, 'Node');
export type Node = io.TypeOf<typeof NodeIO>;



export const createNode =
    (position: Position, symbol: NodeSymbol, session: string): Node => ({
        kind: 'node',
        id: uuid(),
        time: Date.now(),
        position,
        symbol,
        session,
    });


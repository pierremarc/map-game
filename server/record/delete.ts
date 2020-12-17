
import * as uuid from 'uuid';
import * as io from 'io-ts';



export const DeleteIO = io.interface({
    kind: io.literal('delete'),
    id: io.string,
    time: io.number,
    session: io.string,
    node: io.string,
}, 'Delete');
export type Delete = io.TypeOf<typeof DeleteIO>;



export const createDelete =
    (node: string, session: string): Delete => ({
        kind: 'delete',
        id: uuid(),
        time: Date.now(),
        session,
        node,
    });


export const deleteToJSON =
    (r: Delete) => ({
        type: 'delete',
        id: r.id,
        user: r.session,
        data: {
            node: r.node,
        },
    })


import * as io from 'io-ts';

import { Either } from "fp-ts/lib/Either";




const i = io.interface;
const u = io.union;
const l = io.literal;

export const MessagetTypeIO = u([
    l('move'),
    l('select'),
    l('drop'),
    l('write'),
    l('citem'),
], 'MessagetTypeIO');
export type MessageType = io.TypeOf<typeof MessagetTypeIO>;

export const BaseMessageIO = i({
    id: io.string,
    user: io.string,
    // type: MessagetTypeIO,
}, 'MessageIO');

// const PartialMessageIO =
//     <T, MT extends MessageType>(dataType: io.Type<T>, t: MT) => io.intersection([
//         BaseMessageIO,
//         i({
//             type: l(t),
//             data: dataType,
//         })
//     ]);

const PartialMessageIO =
    <T>(dataType: io.Type<T>) => io.intersection([
        BaseMessageIO,
        i({
            data: dataType,
        })
    ]);

export const MoveDataIO = i({
    x: io.number,
    y: io.number,
});
export type MoveData = io.TypeOf<typeof MoveDataIO>;

export const SelectDataIO = i({
    item: io.string,
});
export type SelectData = io.TypeOf<typeof SelectDataIO>;


export const DropDataIO = io.intersection([MoveDataIO, SelectDataIO]);
export type DropData = io.TypeOf<typeof DropDataIO>;

const WriteDataIO = i({
    node: io.string,
    content: io.string,
});
export type WriteData = io.TypeOf<typeof WriteDataIO>;


export const CitemDataIO = i({
    name: io.string,
    encoded: io.string,
})
export type CitemData = io.TypeOf<typeof CitemDataIO>;

// export const MoveMessageIO = PartialMessageIO(MoveDataIO, 'move');
// export const SelectMessageIO = PartialMessageIO(SelectDataIO, 'select');
// export const DropMessageIO = PartialMessageIO(DropDataIO, 'drop');
// export const WriteMessageIO = PartialMessageIO(WriteDataIO, 'write');

export const MoveMessageIO = PartialMessageIO(MoveDataIO);
export const SelectMessageIO = PartialMessageIO(SelectDataIO);
export const DropMessageIO = PartialMessageIO(DropDataIO);
export const WriteMessageIO = PartialMessageIO(WriteDataIO);
export const CitemMessageIO = PartialMessageIO(CitemDataIO);

export type MoveMessage = io.TypeOf<typeof MoveMessageIO> & { type: 'move' };
export type SelectMessage = io.TypeOf<typeof SelectMessageIO> & { type: 'select' };
export type DropMessage = io.TypeOf<typeof DropMessageIO> & { type: 'drop' };
export type WriteMessage = io.TypeOf<typeof WriteMessageIO> & { type: 'write' };
export type CitemMessage = io.TypeOf<typeof CitemMessageIO> & { type: 'citem' };

export const UntypedMessageIO = u([
    MoveMessageIO,
    SelectMessageIO,
    DropMessageIO,
    WriteMessageIO,
    CitemMessageIO,
], 'UntypedMessageIO')

export type Message_ = io.TypeOf<typeof UntypedMessageIO>;
export type Message<MT extends MessageType> = Message_ & { type: MT };

export const validate =
    (data: any) => {
        const X = io.intersection([
            UntypedMessageIO,
            i({ type: MessagetTypeIO })
        ]);

        const ret: Either<io.ValidationError[], io.TypeOf<typeof X>> = X.validate(data, []);
        return ret;
    };
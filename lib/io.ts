import * as io from 'io-ts';




const i = io.interface;
const u = io.union;
const l = io.literal;

export const ClientConfigIO = i({
    name: io.string,
    websocket: io.string,
}, 'ClientConfigIO');

export type ClientConfig = io.TypeOf<typeof ClientConfigIO>;

export const MessagetTypeIO = u([
    l('connect'),
    l('move'),
    l('select'),
    l('deselect'),
    l('drop'),
    l('write'),
    l('citem'),
    l('delete'),
], 'MessagetTypeIO');
export type MessageType = io.TypeOf<typeof MessagetTypeIO>;

export const BaseMessageIO = i({
    id: io.string,
    user: io.string,
}, 'MessageIO');

const PartialMessageIO =
    <T, V extends MessageType>(dataType: io.Type<T>, tag: io.LiteralC<V>) => io.intersection([
        BaseMessageIO,
        i({
            type: tag,
            data: dataType,
        })
    ]);

export const ConnectDataIO = i({
    map: io.string,
});
export type ConnectData = io.TypeOf<typeof ConnectDataIO>;


export const MoveDataIO = i({
    x: io.number,
    y: io.number,
});
export type MoveData = io.TypeOf<typeof MoveDataIO>;

export const SelectDataIO = i({
    item: io.string,
});
export type SelectData = io.TypeOf<typeof SelectDataIO>;

export const DeSelectDataIO = i({});
export type DeSelectData = io.TypeOf<typeof DeSelectDataIO>;


export const DropDataIO = i({
    x: io.number,
    y: io.number,
    item: io.string,
});
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

export const DeleteDataIO = i({
    node: io.string,
})
export type DeleteData = io.TypeOf<typeof DeleteDataIO>


export const ConnectMessageIO = PartialMessageIO(ConnectDataIO, l('connect'));
export const MoveMessageIO = PartialMessageIO(MoveDataIO, l('move'));
export const SelectMessageIO = PartialMessageIO(SelectDataIO, l('select'));
export const DeSelectMessageIO = PartialMessageIO(DeSelectDataIO, l('deselect'));
export const DropMessageIO = PartialMessageIO(DropDataIO, l('drop'));
export const WriteMessageIO = PartialMessageIO(WriteDataIO, l('write'));
export const CitemMessageIO = PartialMessageIO(CitemDataIO, l('citem'));
export const DeleteMessageIO = PartialMessageIO(DeleteDataIO, l('delete'));

export type ConnectMessage = io.TypeOf<typeof ConnectMessageIO>;
export type MoveMessage = io.TypeOf<typeof MoveMessageIO>;
export type SelectMessage = io.TypeOf<typeof SelectMessageIO>;
export type DeSelectMessage = io.TypeOf<typeof DeSelectMessageIO>;
export type DropMessage = io.TypeOf<typeof DropMessageIO>;
export type WriteMessage = io.TypeOf<typeof WriteMessageIO>;
export type CitemMessage = io.TypeOf<typeof CitemMessageIO>;
export type DeleteMessage = io.TypeOf<typeof DeleteMessageIO>;

export const MessageIO = u([
    ConnectMessageIO,
    MoveMessageIO,
    SelectMessageIO,
    DeSelectMessageIO,
    DropMessageIO,
    WriteMessageIO,
    CitemMessageIO,
    DeleteMessageIO,
], 'UntypedMessageIO')

export type Message = io.TypeOf<typeof MessageIO>;

export type MessageT<T extends MessageType> =
    T extends 'connect' ? ConnectMessage :
    T extends 'move' ? MoveMessage :
    T extends 'select' ? SelectMessage :
    T extends 'deselect' ? DeSelectMessage :
    T extends 'drop' ? DropMessage :
    T extends 'write' ? WriteMessage :
    T extends 'citem' ? CitemMessage :
    T extends 'delete' ? DeleteMessage : unknown
    ;

export const HeloMessageIO = i({
    type: l('helo'),
    user: io.string,
})


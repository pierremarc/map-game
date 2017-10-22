"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("io-ts");
const i = io.interface;
const u = io.union;
const l = io.literal;
exports.MessagetTypeIO = u([
    l('move'),
    l('select'),
    l('drop'),
    l('write'),
], 'MessagetTypeIO');
exports.BaseMessageIO = i({
    id: io.string,
    user: io.string,
}, 'MessageIO');
const PartialMessageIO = (dataType) => io.intersection([
    exports.BaseMessageIO,
    i({
        data: dataType,
    })
]);
const MoveDataIO = i({
    x: io.number,
    y: io.number,
});
const SelectDataIO = i({
    item: io.string,
});
const DropDataIO = io.intersection([MoveDataIO, SelectDataIO]);
const WriteDataIO = i({
    content: io.string,
});
exports.MoveMessageIO = PartialMessageIO(MoveDataIO);
exports.SelectMessageIO = PartialMessageIO(SelectDataIO);
exports.DropMessageIO = PartialMessageIO(DropDataIO);
exports.WriteMessageIO = PartialMessageIO(WriteDataIO);
exports.UntypedMessageIO = u([
    exports.MoveMessageIO,
    exports.SelectMessageIO,
    exports.DropMessageIO,
    exports.WriteMessageIO,
], 'UntypedMessageIO');
exports.validate = (data) => {
    const X = io.intersection([
        exports.UntypedMessageIO,
        i({ type: exports.MessagetTypeIO })
    ]);
    const ret = X.validate(data, []);
    return ret;
};

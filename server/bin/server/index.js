"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e = require("express");
const ws = require("ws");
const Array_1 = require("fp-ts/lib/Array");
const start = () => {
    const app = e();
    const server = app.listen(3333, () => {
        const wss = new ws.Server({ server });
        let xs = [];
        wss.on('connection', function connection(s, _req) {
            xs = Array_1.cons(s)(xs);
            const without = Array_1.filter((as) => as !== s);
            s.on('message', (msg) => {
                try {
                    const data = JSON.stringify(JSON.parse(msg.toString()));
                    without(xs).forEach(x => x.send(data));
                    console.log(`broadcasted |> ${data}`);
                }
                catch (err) {
                    console.error(err);
                }
            });
        });
    });
};
start();

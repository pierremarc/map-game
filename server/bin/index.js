"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e = require("express");
const ws = require("ws");
const Array_1 = require("fp-ts/lib/Array");
const Option_1 = require("fp-ts/lib/Option");
const opened = Option_1.fromPredicate((x) => x.readyState === ws.OPEN);
const start = () => {
    const app = e();
    app.use(e.static('public'));
    const server = app.listen(3333, '0.0.0.0', () => {
        const wss = new ws.Server({ server });
        let xs = [];
        wss.on('connection', function connection(s, _req) {
            const withoutMe = Array_1.filter((as) => as !== s);
            xs = Array_1.cons(s)(xs);
            s.on('message', (msg) => {
                try {
                    const data = JSON.stringify(JSON.parse(msg.toString()));
                    withoutMe(xs)
                        .forEach(x => opened(x).map(xo => xo.send(data)));
                    console.log(`broadcasted |> ${data}`);
                }
                catch (err) {
                    console.error(err);
                }
            });
            s.on('close', () => xs = withoutMe(xs));
        });
    });
};
start();

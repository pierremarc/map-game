import * as e from 'express';
import * as ws from 'ws';
// import { MoveMessage } from '../lib/io';
import { cons, filter } from "fp-ts/lib/Array";
import { fromPredicate } from 'fp-ts/lib/Option';

const opened = fromPredicate((x: ws) => x.readyState === ws.OPEN);

const start =
    () => {
        const app = e();
        app.use(e.static('public'));
        const server = app.listen(3333, '0.0.0.0', () => {
            const wss = new ws.Server({ server });
            let xs: ws[] = [];

            wss.on('connection', function connection(s, _req) {
                const withoutMe = filter((as: ws) => as !== s);
                xs = cons(s)(xs)

                s.on('message', (msg) => {
                    try {
                        const data = JSON.stringify(JSON.parse(msg.toString()));
                        withoutMe(xs)
                            .forEach(x => opened(x).map(xo => xo.send(data)))
                        console.log(`broadcasted |> ${data}`);
                    }
                    catch (err) {
                        console.error(err);
                    }
                })

                s.on('close', () => xs = withoutMe(xs));

            });
        })
    }


start();

import * as e from 'express';
import * as ws from 'ws';
import { MoveMessage } from '../lib/io';


const start =
    () => {
        const app = e();
        const server = app.listen(3333, () => {
            const wss = new ws.Server({ server });
            wss.on('connection', function connection(s, req) {
                // const location = url.parse(req.url, true);
                // You might use location.query.access_token to authenticate or share sessions
                // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

                // ws.on('message', function incoming(message) {
                //     console.log('received: %s', message);
                // });

                setInterval(() => {
                    const m: MoveMessage = {
                        id: 'foo',
                        user: 'bar',
                        data: {
                            x: Math.random(),
                            y: Math.random(),
                        }
                    }
                    s.send(JSON.stringify(m));
                }, 1000);
            });
        })
    }


start();

import * as e from 'express';
import * as ws from 'ws';
import * as uuid from 'uuid';
import slugify from './slugify';
import { readdir } from 'fs';
import { createServer, Server } from 'http';
import { DropMessageIO, WriteMessageIO, CitemMessageIO } from '../lib/io';
import { cons, filter } from "fp-ts/lib/Array";
import { fromPredicate, some, none } from 'fp-ts/lib/Option';
import { initLogFile, LogFile } from './log';
import { createNode, createText, createSymbol, nodeToJSON, textToJSON, symbolToJSON } from './record';

const opened = fromPredicate((x: ws) => x.readyState === ws.OPEN);

const WS_BASE_PORT = 3333;
const MapsMountPoint = '/maps/';
const WsMountPoint = '/ws/';
const LogsDir = 'logs';

interface LogRecord {
    name: string;
    url: string;
}

const records: LogRecord[] = [];



const startWS =
    (server: Server,
        port: number,
        path: string,
        lf: LogFile) => {

        const wss = new ws.Server({
            path,
            server,
            port
        });

        let xs: ws[] = [];

        const broadcast =
            (msg: string) => xs.forEach(x => opened(x).map(xo => xo.send(msg)));

        wss.on('connection', function connection(s, _req) {
            const withoutMe = (as: ws) => as !== s;
            const session = uuid();
            xs = cons(s, xs)

            // s.on('open', () => {
            console.log(`Session connected ${session} `);
            lf.tell().map(r => {
                switch (r.kind) {
                    case 'node': return s.send(JSON.stringify(nodeToJSON(r)))
                    case 'text': return s.send(JSON.stringify(textToJSON(r)))
                    case 'symbol': return s.send(JSON.stringify(symbolToJSON(r)))
                }
            });
            // });

            s.on('message', (msg) => {
                try {
                    const Obj = JSON.parse(msg.toString());

                    const dropRecord = DropMessageIO.validate(Obj, [])
                        .map(({ data }) =>
                            lf.log(
                                createNode({ x: data.x, y: data.y }, data.item, session)))
                        .map(r => broadcast(JSON.stringify(nodeToJSON(r))));

                    const writeRecord = WriteMessageIO.validate(Obj, [])
                        .map(({ data }) =>
                            lf.log(
                                createText(data.node, data.content, session)))
                        .map(r => broadcast(JSON.stringify(textToJSON(r))));

                    const citemRecord = CitemMessageIO.validate(Obj, [])
                        .map(({ data }) =>
                            lf.log(
                                createSymbol(data.name, data.encoded, session)))
                        .map(r => broadcast(JSON.stringify(symbolToJSON(r))));

                    if (dropRecord.isRight() || writeRecord.isRight() || citemRecord.isRight()) {
                        lf.sync();
                    }
                    else {
                        broadcast(JSON.stringify(Obj));
                    }

                }
                catch (err) {
                    console.error(err);
                }
            })

            s.on('close', () => xs = filter(xs, withoutMe));

        });
    }



const makeMapIndex =
    (hostname: string, port: number, wsPath: string) =>
        `<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="stylesheet" href="/out/style.css" />
    <script>
    window.mapLogServer = 'ws://${hostname}:${port}${wsPath}';
    </script>
    <script src="/out/client.js"></script>
</head> <body></body> </html>`


let lastUsedPort = WS_BASE_PORT;

const registerRoute =
    (rootDir: string, server: Server, r: e.Router, name: string) => {
        const path = `${MapsMountPoint}${name}`;
        const wsPath = `${WsMountPoint}${name}`;
        lastUsedPort += 1;
        const port = lastUsedPort;
        r.get(`/${name}`,
            (rq, rs) => rs.send(makeMapIndex(rq.hostname, port, wsPath)))
        console.log(`Added Log "/${name}" `)
        return (
            new Promise<string>((resolve, _reject) =>
                initLogFile(rootDir, name)
                    .map((lf) => {
                        startWS(server, port, wsPath, lf);
                        r.get(`/${name}.geojson`, (rq, rs) => {
                            rs.set('Content-Type', 'application/json')
                            rs.set('Access-Control-Allow-Origin', ['*']);
                            rs.set('Access-Control-Allow-Methods', 'GET');
                            return rs.send(lf.json());
                        })
                        console.log(`Added GeoJSON "/${name}.geojson" `)
                        records.push({ name, url: path });
                        resolve(path);
                    })
                    .run())
        )
    }

const getName = ({ query }: e.Request) => {
    if (query.name && typeof query.name === 'string') {
        return some(query.name)
    }
    return none;
}

const startLog =
    (rootDir: string, server: Server, router: e.Router) =>
        (request: e.Request, response: e.Response) => getName(name)
            .foldL(
                () => {
                    response.status(500).send('Cannot find a name in request')
                },
                name => {
                    const slug = slugify(name.slice(0, 128));
                    registerRoute(rootDir, server, router, slug)
                        .then(path => response.redirect(path))
                }
            )


const index =
    (_request: e.Request, response: e.Response) => {
        const rs = records.map(({ name, url }) => `<p><a href="${url}">${name}</a></p>`).join('\n');
        response.send(`<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
</head> <body>
<h1>Logs</h1>
${rs}

<form action="/createlog/" method="get">
<input type="text" placeholder="name" name="name" />
<input type="submit" value="Create Log" />
</form>
</body> </html>`)
    }

const start =
    () => {
        const app = e();
        const router = e.Router();
        const server = createServer(app);

        app.use(MapsMountPoint, router);
        app.get('/', index);
        app.get('/createlog/', startLog(LogsDir, server, router));
        app.use(e.static('public'));

        readdir(LogsDir, (err, files) => {
            if (err) {
                console.error(`Could not read logs dir ${LogsDir}`)
            }
            else {
                files.forEach(f => registerRoute(LogsDir, server, router, f))
            }
        })


        server.listen(3333, '0.0.0.0', () => {
            console.log('Started on  http://0.0.0.0:3333');
        })
    }


start();

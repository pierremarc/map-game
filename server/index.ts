import * as e from 'express';
import * as cors from 'cors';
import slugify from './slugify';
import { readdir } from 'fs';
import { createServer, Server } from 'http';
import { some, none, fromNullable } from 'fp-ts/lib/Option';
import { initLogFile, LogFile } from './log';
import { startWS, WEBSOCKET_PORT } from './websocket';
import { pushLogRecord, getLogRecords } from './record';


const MapsMountPoint = '/maps/';
const WsMountPoint = '/ws/';
const LogsDir = 'logs';



const makeMapIndex = (
    url: string,
    logname: string,
) =>
    `<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="stylesheet" href="/out/style.css" />
    <script>
    window.mapLogServer = {
        name: "${logname}",
        websocket: "${url}",
    };
    </script>
    <script src="/out/client.js"></script>
</head> <body></body> </html>`


const registerRoute =
    (rootDir: string, r: e.Router, name: string) => {
        console.log(`Add Log "/${name}" `)
        const path = `${MapsMountPoint}${name}`;
        r.get(`/${name}`,
            (rq, rs) => rs.send(
                makeMapIndex(
                    fromNullable(process.env.MAPLOG_WEBSOCKET_URL)
                        .getOrElse(`ws://${rq.hostname}${WsMountPoint}`),
                    name)))
        return (
            new Promise<string>((resolve, _reject) =>
                initLogFile(rootDir, name)
                    .map((lf) => {
                        const jsonpath = `/${name}.geojson`
                        const jsoncors = cors({ origin: (origin, callback) => callback(null, true) })
                        r.options(jsonpath, jsoncors)
                        r.get(jsonpath, jsoncors, (rq, rs) => {
                            rs.set({
                                'content-disposition': `attachment;filename=${name}.geojson`,
                                'content-type': 'application/json',
                            })
                            rs.send(lf.json())
                        })

                        console.log(`Added GeoJSON "/${name}.geojson" `)

                        pushLogRecord({ name, url: path, file: lf });
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
        (request: e.Request, response: e.Response) => getName(request)
            .foldL(
                () => {
                    response.status(500).send('Cannot find a name in request')
                },
                name => {
                    console.log('name', name)
                    const slug = slugify(name.slice(0, 128));
                    const mapExists = getLogRecords().find(l => l.name === slug);
                    if (mapExists !== undefined) {
                        response.redirect(mapExists.url)
                    }
                    else {
                        registerRoute(rootDir, router, slug)
                            .then(path => response.redirect(path))
                    }
                }
            )


const index =
    (_request: e.Request, response: e.Response) => {
        // const rs = getLogRecords().map(({ name, url }) => `<p><a href="${url}">${name}</a></p>`).join('\n');
        response.send(`<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="stylesheet" href="/out/style.css" />
</head> 
<body class='home'>
    <div class='header'>
        <div class='header-logo'>map-log</div>            
        <div class='header-links'>
            <a href='https://github.com/pierremarc/map-game/blob/master/documentation/maplog.md'>documentation</a>
        </div>            
    </div>
    <div class='main'>
        <h1>Collaborative mapping </br> & territorial annotation</h1>
        <div class='pitch'>free, no-account needed & <a href="https://github.com/pierremarc/map-game" title="Git Repository">open-source</a></div>

        <form action="/createlog/" method="get">
        <h2>Join a map</h2>
        <input type="text" placeholder="Give it a name" name="name" />
        <input type="submit" value="Join" />
        </form>
    </div>
    

    <div class='footer'>
            <span>Beta Version - Developped in Brussels by 
            <a href='https://atelier-cartographique.be'>atelier cartographique</a>
            - Basemap ©
            <a href='https://www.openstreetmap.org/copyright/en'>OpenStreetMap Contributors</a>
            </span>

    </div>

</body> </html>`)
    }

const start =
    () => {
        const app = e();
        const router = e.Router();
        const server = createServer(app);
        app.use((req, res, next) => {
            console.log(`>> ${req.path}`)
            next()
        })

        app.use(MapsMountPoint, router);
        app.get('/', index);
        app.get('/createlog/', startLog(LogsDir, server, router));
        app.use(e.static('public'));

        readdir(LogsDir, (err, files) => {
            if (err) {
                console.error(`Could not read logs dir ${LogsDir}`)
            }
            else {
                files.forEach(f => registerRoute(LogsDir, router, f))
            }
        })


        server.listen(3333, '0.0.0.0', () => {
            console.log('Started main server on  http://0.0.0.0:3333');
            startWS(server, WEBSOCKET_PORT, WsMountPoint);
        })
    }


start();

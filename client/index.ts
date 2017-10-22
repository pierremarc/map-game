import * as uuid from 'uuid';
import { connect } from './connection';
import { createMap } from './map';
import { createUsers } from './user';
import { style, px } from './dom';
import { MoveData } from '../lib/io';

const log = (...m: any[]) => console.log(...m);

const start =
    (url: string) => {
        const user = uuid.v4();
        const { subscribe, send } = connect(url);
        const moves = subscribe('move');
        const { userDo } = createUsers();
        const map = createMap(user);

        moves((mo) => mo.map(m => userDo(m.user)((elem) => {
            const { width, height } = elem.getBoundingClientRect();
            const { x, y } = m.data as MoveData;
            const pos = map.olMap.getPixelFromCoordinate([x, y])
            style(elem, {
                top: px(pos[1] - (height / 2)),
                left: px(pos[0] - (width / 2)),
            });
        })));
        map.move.subscribe(m => send(m));


    };


document.onreadystatechange = () => {
    if ('interactive' === document.readyState) {
        log(`starting`);
        start('ws://127.0.0.1:3333');
    }
};
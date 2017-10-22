import * as uuid from 'uuid';
import { connect } from './connection';
import { createMap } from './map';
import { createUsers } from './user';
import { style, px, appendText, emptyElement } from './dom';
import { MoveData, SelectData, Message, DropData } from '../lib/io';
import { createItems, createItem } from './items';
import { cons, head } from 'fp-ts/lib/Array';

const log = (...m: any[]) => console.log(...m);

const start =
    (url: string) => {
        const user = uuid.v4();
        const { subscribe, send } = connect(url);
        const moves = subscribe('move');
        const selects = subscribe('select');
        const drops = subscribe('drop');
        const { userDo } = createUsers();
        const items = createItems(user);

        let sm: Message<'select'>[] = [];


        const getSelected =
            () => head(sm)

        const map = createMap(user, getSelected);

        moves(mo => mo.map(m => userDo(m.user)((elem) => {
            const { width, height } = elem.getBoundingClientRect();
            const { x, y } = m.data as MoveData;
            const pos = map.olMap.getPixelFromCoordinate([x, y])
            style(elem, {
                top: px(pos[1] - (height / 2)),
                left: px(pos[0] - (width / 2)),
            });
        })));

        selects(se => se.map(s => userDo(s.user)((elem) => {
            const data = s.data as SelectData;
            emptyElement(elem);
            appendText(data.item)(elem);
        })))

        drops(dr => dr.map(d => userDo(d.user)((/* elem */) => {
            const data = d.data as DropData;
            map.addOverlay(createItem(data.item), [data.x, data.y]);
        })))


        items.subscribe(s => {
            sm = cons(s)(sm);
            return send(s);
        });


        map.move.subscribe(m => send(m));
        map.drop.subscribe(d => {
            const data = d.data as DropData;
            map.addOverlay(createItem(data.item), [data.x, data.y]);
            return send(d);
        });
    };


document.onreadystatechange = () => {
    if ('interactive' === document.readyState) {
        log(`starting`);
        const loc = document.location;

        start(`ws://${loc.hostname}:3333`);
    }
};
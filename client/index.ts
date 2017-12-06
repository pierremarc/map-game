import * as uuid from 'uuid';
import { connect } from './connection';
import { createMap } from './map';
import { createUsers } from './user';
import { style, px, appendText, emptyElement } from './dom';
import { MoveData, SelectData, Message, DropData, CitemData, WriteData } from '../lib/io';
import { createItemFactory, createItemWidget, createItemNodeFor } from './items';
import { cons, head } from 'fp-ts/lib/Array';
import { createTextWidget } from './text';
import { fromPredicate } from 'fp-ts/lib/Option';

const log = (...m: any[]) => console.log(...m);

const start =
    (url: string) => {
        const user = uuid.v4();
        const { subscribe, send } = connect(url);
        const moves = subscribe('move');
        const selects = subscribe('select');
        const drops = subscribe('drop');
        const citems = subscribe('citem');
        const writes = subscribe('write');
        const { userDo } = createUsers();
        const { select, createItem } = createItemFactory(user);
        const cStream = createItemWidget(user);
        const { setAttachmentNode, appendTextNode, selectStream, textStream } = createTextWidget(user);

        let sm: Message<'select'>[] = [];
        const getSelected = () => head(sm)
        const map = createMap(user, getSelected);

        select.subscribe(s => {
            sm = cons(s)(sm);
            return send(s);
        });
        cStream.subscribe(send);
        textStream.subscribe(send);
        map.move.subscribe(send);
        map.drop.subscribe(send);

        const moveWithoutMe = fromPredicate<Message<"move">>(m => m.user !== user);

        moves(mo => mo.chain(moveWithoutMe).map(m => userDo(m.user)((elem) => {
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
            appendText(data.item[0])(elem);
        })))

        drops(dr => dr.map(d => {
            const data = d.data as DropData;
            map.addOverlay(
                d.id,
                createItemNodeFor(data.item,
                    () => {
                        setAttachmentNode(d.id);
                        map.selectItem(d.id);
                    }),
                [data.x, data.y]);
        }))

        selectStream.subscribe((nid) => {
            setAttachmentNode(nid);
            map.selectItem(nid);
            return nid;
        });

        citems(ci => ci.map(({ data }) => createItem(data as CitemData)))

        writes(wr => wr.map(w => appendTextNode(w.data as WriteData)))


    };


document.onreadystatechange = () => {
    if ('interactive' === document.readyState) {
        log(`starting`);
        const wsServer = (<any>window).mapLogServer as string;
        start(wsServer);
    }
};
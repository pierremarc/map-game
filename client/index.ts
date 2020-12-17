// import * as uuid from 'uuid';
import { connect } from './connection';
import { createMap } from './map';
import { createUsers } from './user';
import { style, px, appendText, emptyElement, getRegistered, TEXT } from './dom';
import { MoveData, SelectData, MessageT, DropData, CitemData, WriteData, ClientConfig, DeSelectMessage } from '../lib/io';
import { createItemFactory, createItemWidget, createItemNodeFor } from './items';
import { cons, head } from 'fp-ts/lib/Array';
import { createTextWidget } from './text';
import { fromPredicate } from 'fp-ts/lib/Option';
import { getConfig } from './config';
import { layout } from './layout';
import uuid = require('uuid');


const start =
    (config: ClientConfig) => connect(config)
        .then(({ subscribe, send, user }) => {
            layout();
            const moves = subscribe('move');
            const selects = subscribe('select');
            const deselects = subscribe('deselect');
            const drops = subscribe('drop');
            const citems = subscribe('citem');
            const writes = subscribe('write');
            const { userDo } = createUsers();
            const { deselect, select, createItem } = createItemFactory(user);
            const cStream = createItemWidget(user);
            const { setAttachmentNode, appendTextNode, selectStream, textStream } = createTextWidget(user);

            let sm: MessageT<'select'>[] = [];
            const getSelected = () => head(sm)
            const map = createMap(user, getSelected);

            getRegistered('title').map(el => el.appendChild(TEXT(config.name)))

            getRegistered('deselect').map(elem => {
                elem.addEventListener('click', () => {
                    const m: DeSelectMessage = {
                        user,
                        id: uuid.v4(),
                        type: 'deselect',
                        data: {},

                    };
                    send<'deselect'>(m)
                    sm = []
                    deselect.feed(m)
                })
            })

            select.subscribe(s => {
                sm = cons(s, sm);
                const ret = send<'select'>(s)
                return ret;
            });
            cStream.subscribe(s => send<'citem'>(s));
            textStream.subscribe(s => send<'write'>(s));
            map.move.subscribe(s => send<'move'>(s));
            map.drop.subscribe(s => {
                if (user === s.user) {
                    const m: DeSelectMessage = {
                        user,
                        id: uuid.v4(),
                        type: 'deselect',
                        data: {},

                    };
                    sm = []
                    send<'deselect'>(m)
                    deselect.feed(m)
                }
                return send<'drop'>(s)
            });

            const moveWithoutMe = fromPredicate<MessageT<"move">>(m => m.user !== user);
            const selectWithoutMe = fromPredicate<MessageT<"select">>(m => m.user !== user);
            const dselectWithoutMe = fromPredicate<MessageT<"deselect">>(m => m.user !== user);


            moves(mo => mo.chain(moveWithoutMe).map(m => userDo(m.user)((elem) => {
                const { width, height } = elem.getBoundingClientRect();
                const { x, y } = m.data as MoveData;
                const { left, top, right, bottom } = map.olMap.getViewport().getBoundingClientRect();
                const mapPos = map.olMap.getPixelFromCoordinate([x, y])
                const [mapx, mapy] = (() => {
                    const x = (left + mapPos[0]) - (width / 2)
                    const y = (top + mapPos[1]) - (height / 2)
                    return [
                        Math.min(Math.max(x, left), right - width),
                        Math.min(Math.max(y, top), bottom - height),
                    ]
                })()
                style(elem, {
                    top: px(mapy),
                    left: px(mapx),
                });
            })));

            selects(se => se.chain(selectWithoutMe).map(s => userDo(s.user)((elem) => {
                const data = s.data as SelectData;
                emptyElement(elem);
                appendText(data.item[0])(elem);
            })))

            deselects(de => de.chain(dselectWithoutMe).map(d => {
                userDo(d.user)((elem) => {
                    emptyElement(elem);
                })
            }))

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


        });


document.onreadystatechange = () => {
    if ('interactive' === document.readyState) {
        getConfig().map(start)
    }
};
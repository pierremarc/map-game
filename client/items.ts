
import * as debug from 'debug';
import * as uuid from 'uuid';
import { DIV, INPUT, IMG, TEXT, CANVAS } from './dom';
import { MessageStreamI, createMessageStream } from './stream';
import { CitemData } from '../lib/io';
import { fromNullable } from 'fp-ts/lib/Option';

const logger = debug('ml:items');
type Encoded = { [k: string]: string };
const itemsCache: Encoded = {};
const markSize = 32;

const createItemNode =
    (c: string) => {
        const node = DIV({
            'class': 'item',
            id: c,
            title: c,
        },
            IMG({
                src: itemsCache[c],
            }));
        node.style.width = `${markSize}px`;
        node.style.height = `${markSize}px`;
        return node;
    }


export const createItemNodeFor =
    (c: string, h: () => void) => {
        const node = createItemNode(c);
        logger(`on ${c}`)
        node.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logger('click on item');
            h();
        }, false);
        return node;
    }


const selectableItem =
    (user: string, s: MessageStreamI<'select'>) =>
        (item: CitemData) => {
            const { name, encoded } = item;
            itemsCache[name] = encoded;

            const elem = createItemNode(name);
            elem.addEventListener('click', () => s.feed({
                user,
                id: uuid.v4(),
                type: 'select',
                data: {
                    item: name,
                }
            }), false);

            return elem;
        };

export const createItemFactory =
    (user: string) => {
        const select = createMessageStream<'select'>();
        const builder = selectableItem(user, select);
        const root = DIV({ 'class': 'items' });
        document.body.appendChild(root);

        const createItem =
            (item: CitemData) =>
                root.appendChild(builder(item))

        return {
            select,
            createItem,
        }
    };



const toDataURL =
    (f: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.onabort = reject;
            reader.readAsDataURL(f);
        });
    };




const sz =
    (nh: number, nw: number, sz: number) => {
        const r = nh / nw;
        const s = r > 1 ? sz / nh : sz / nw;
        return {
            hori: {
                s: nw * s,
                offset: r > 1 ? (sz - (nw * s)) / 2 : 0,
            },
            vert: {
                s: nh * s,
                offset: r > 1 ? 0 : (sz - (nh * s)) / 2,
            },
        }
    }

const markable =
    (f: File) =>
        toDataURL(f)
            .then(data => IMG({ src: data }))
            .then((img) => {
                const { hori, vert } = sz(
                    img.naturalHeight,
                    img.naturalWidth,
                    markSize
                )

                const canvas = CANVAS({
                    width: markSize.toString(),
                    height: markSize.toString(),
                });

                return fromNullable(
                    canvas.getContext('2d'))
                    .map((ctx: CanvasRenderingContext2D) => {
                        ctx.clearRect(0, 0, markSize, markSize);
                        ctx.drawImage(
                            img, hori.offset, vert.offset, hori.s, vert.s);
                        return ctx.canvas.toDataURL();
                    })
            })


export const createItemWidget =
    (user: string) => {
        const stream = createMessageStream<'citem'>();
        const widget = DIV({ 'class': 'create-item' });
        const finput = INPUT({ 'type': 'file' });
        const ninput = INPUT({ 'type': 'text' });
        const submit = DIV({ 'class': 'create-submit button' }, TEXT('Create'));

        const create =
            () =>
                fromNullable(finput.files)
                    .map(files => files[0])
                    .map(f =>
                        markable(f)
                            .then(o => o.map((encoded) => {
                                const name = ninput.value.trim();
                                if (name.length > 0) {
                                    stream.feed({
                                        user,
                                        id: uuid(),
                                        type: 'citem',
                                        data: {
                                            name,
                                            encoded,
                                        }
                                    })
                                }
                                ninput.value = '';
                            })));


        submit.addEventListener('click', create, false);
        widget.appendChild(finput);
        widget.appendChild(ninput);
        widget.appendChild(submit);
        document.body.appendChild(widget);

        return stream;

    };

logger('loaded');

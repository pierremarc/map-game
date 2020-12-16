
import * as debug from 'debug';
import * as uuid from 'uuid';
import { DIV, IMG, CANVAS, removeClass, addClass, getRegistered, getRegisteredT } from './dom';
import { MessageStreamI, createMessageStream } from './stream';
import { CitemData } from '../lib/io';
import { fromNullable } from 'fp-ts/lib/Option';
import { scopeOption } from '../lib/scope';

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
        node.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            h();
        }, false);
        return node;
    }


const selectableItem = (
    user: string,
    s: MessageStreamI<'select'>,
    d: MessageStreamI<'deselect'>,
) =>
    (item: CitemData) => {
        const { name, encoded } = item;
        itemsCache[name] = encoded;

        const elem = createItemNode(name);
        elem.addEventListener('click', () => {
            s.feed({
                user,
                id: uuid.v4(),
                type: 'select',
                data: {
                    item: name,
                }
            });

            getRegistered('items').map(
                root => {
                    Array.from(root.children)
                        .forEach(n => removeClass(n, 'active'))

                    addClass(elem, 'active')
                    root.appendChild(elem);
                }
            )
        }, false);

        d.subscribe((m) => {
            getRegistered('items').map(
                root => {
                    Array.from(root.children)
                        .forEach(n => removeClass(n, 'active'))
                }
            )
            return m;
        })
    };

export const createItemFactory =
    (user: string) => {
        const select = createMessageStream<'select'>();
        const deselect = createMessageStream<'deselect'>();
        const builder = selectableItem(user, select, deselect);

        const createItem = (item: CitemData) => builder(item)

        return {
            select,
            deselect,
            createItem,
        }
    };



const toDataURL =
    (f: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.onabort = reject;
            reader.readAsDataURL(f);
        });
    };


const toIMG =
    (f: File) => new Promise<HTMLImageElement>((resolve, _reject) =>
        toDataURL(f)
            .then((data) => {
                const img = IMG();
                img.addEventListener('load', () => resolve(img), false);
                img.src = data;
            })
    )



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
        toIMG(f)
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


        const create = () =>
            scopeOption()
                .let('files', getRegisteredT('item-file').chain(input => fromNullable(input.files)))
                .let('name', getRegisteredT('item-name').map(input => input.value.trim()))
                .map(({ files, name }) => {
                    markable(files[0])
                        .then(o => o.map((encoded) => {
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
                            getRegisteredT('item-name').map(input => input.value = '')
                        }))
                })


        getRegisteredT('item-submit')
            .map(submit =>
                submit.addEventListener('click', create, false)
            )

        return stream;

    };

logger('loaded');

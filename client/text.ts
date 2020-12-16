
import * as debug from 'debug';
import * as uuid from 'uuid';
import { fromNullable } from 'fp-ts/lib/Option';

import { DIV, TEXT, removeClass, addClass, getRegisteredT, getRegistered } from './dom';
import { WriteData } from '../lib/io';
import { createStream, createMessageStream } from './stream';
import { scopeOption } from '../lib/scope';

const logger = debug('ml:text');



const makeTextNode =
    (data: WriteData) =>
        DIV({ 'class': 'text-item' }, TEXT(data.content));

export const createTextWidget =
    (user: string) => {
        const selectStream = createStream<string>();
        const textStream = createMessageStream<'write'>();

        let currentNode: string | null = null;
        const nodeMap: { [k: string]: Element[] } = {};

        const selectNode =
            (id: string) => {
                Object.keys(nodeMap)
                    .forEach(k => nodeMap[k].forEach(e => removeClass(e, 'selected')));
                if (id in nodeMap) {
                    nodeMap[id].forEach(e => addClass(e, 'selected'));
                }
            }
        const setAttachmentNode = (n: string) => {
            currentNode = n;
            selectNode(n);
        };

        const create = () =>
            scopeOption()
                .let('node', fromNullable(currentNode))
                .let('input', getRegisteredT('text-input'))
                .map(({ node, input }) => {
                    const content = input.value;
                    textStream.feed({
                        user,
                        id: uuid(),
                        type: 'write',
                        data: { content, node },
                    });
                    input.value = '';
                })
        getRegistered('text-submit')
            .map(submit =>
                submit.addEventListener('click', create, false)
            )

        const recordNode =
            (id: string, n: Element) => {
                if (!(id in nodeMap)) {
                    nodeMap[id] = [];
                }
                nodeMap[id].push(n);
                n.addEventListener('click',
                    () => selectStream.feed(id), false);
                return n;
            }


        const appendTextNode = (data: WriteData) =>
            getRegistered('text-list')
                .map((textList) => {
                    textList.appendChild(recordNode(data.node, makeTextNode(data)));
                    const height = Array.from(textList.children)
                        .reduce((acc, n) => acc + n.getBoundingClientRect().height, 0);
                    textList.scrollTop = height;
                })

        return { setAttachmentNode, appendTextNode, selectNode, selectStream, textStream };
    }


logger('loaded');

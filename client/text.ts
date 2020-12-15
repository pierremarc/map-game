
import * as debug from 'debug';
import * as uuid from 'uuid';
import { fromNullable } from 'fp-ts/lib/Option';

import { DIV, TEXTAREA, TEXT, removeClass, addClass } from './dom';
import { WriteData } from '../lib/io';
import { createStream, createMessageStream } from './stream';

const logger = debug('ml:text');



const makeTextNode =
    (data: WriteData) =>
        DIV({ 'class': 'text-item' }, TEXT(data.content));

export const createTextWidget =
    (user: string) => {
        const selectStream = createStream<string>();
        const textStream = createMessageStream<'write'>();
        const widget = DIV({ 'class': 'text' });
        const wtitle = DIV({ 'class': 'widget-title' }, TEXT('Comment the map'));
        const wdesc = DIV({ 'class': 'widget-desc' }, TEXT('Select a sticker on the map, and write a comment below'));
        const textList = DIV({ 'class': 'list' });
        const form = DIV({ 'class': 'form' });
        const input = TEXTAREA({ 'rows': '4' });
        const submit = DIV({ 'class': 'btn btn--submit' }, TEXT('Submit comment'));
        widget.appendChild(form);
        widget.appendChild(textList);
        form.appendChild(wtitle);
        form.appendChild(wdesc);
        form.appendChild(input);
        form.appendChild(submit);
        document.body.appendChild(widget);


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

        const create =
            () => fromNullable(currentNode)
                .map((node) => {
                    const content = input.value;
                    textStream.feed({
                        user,
                        id: uuid(),
                        type: 'write',
                        data: { content, node },
                    });
                    input.value = '';
                })

        submit.addEventListener('click', create, false);

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


        const appendTextNode =
            (data: WriteData) => {
                textList.appendChild(recordNode(data.node, makeTextNode(data)));
                const height = Array.from(textList.children).reduce((acc, n) => acc + n.getBoundingClientRect().height, 0);
                textList.scrollTop = height;
            }

        return { setAttachmentNode, appendTextNode, selectNode, selectStream, textStream };
    }


logger('loaded');

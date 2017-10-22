
import * as uuid from 'uuid';
import { DIV, I } from './dom';
import { StreamI, createStream } from './stream';

const cats = [
    'female',
    'gay',
    'genderless',
    'heterosexual',
    'intergender',
    'lesbian',
    'male',
    'man',
    'neuter',
    'non binary transgender',
    'other gender',
    'transgender',
    'woman',
];

export const createItem =
    (c: string) => (
        DIV({
            'class': 'item',
            id: c,
            title: c,
        },
            I({ 'class': `icon ${c}` })));

const selectableItem =
    (user: string, s: StreamI<'select'>) =>
        (c: string) => {
            const elem = createItem(c);

            elem.addEventListener('click', () => s.feed({
                user,
                id: uuid.v4(),
                type: 'select',
                data: {
                    item: c,
                }
            }));

            return elem;
        };

export const createItems =
    (user: string) => {
        const select = createStream<'select'>();
        const items = cats.map(selectableItem(user, select));
        const elem = DIV({ 'class': 'items' }, ...items);
        document.body.appendChild(elem);

        return select;
    } 
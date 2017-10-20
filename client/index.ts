
import { connect } from './connection';

const log = (...m: any[]) => console.log(...m);

const start =
    (url: string) => {
        const { subscribe } = connect(url);

        const mv = subscribe('move');

        mv((mo) => mo.map(m => log(m)));
    }


start('ws://127.0.0.1:3333');

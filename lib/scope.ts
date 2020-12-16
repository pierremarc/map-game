
import * as debug from 'debug';

const logger = debug('ml:lib/scope');

import { Some, None, some } from 'fp-ts/lib/Option';


declare module 'fp-ts/lib/Option' {
    interface None<A> {
        let<N extends string, B>(name: N, other: Option<B> | ((a: A) => Option<B>)): Option<A & { [K in N]: B }>;

        pick<N extends keyof A>(name: N): Option<A[N]>;
    }
    interface Some<A> {
        let<N extends string, B>(name: N, other: Option<B> | ((a: A) => Option<B>)): Option<A & { [K in N]: B }>;

        pick<N extends keyof A>(name: N): Option<A[N]>;
    }
}

None.prototype.let = function () {
    return this;
};

None.prototype.pick = function () {
    return this;
};

Some.prototype.let = function (name, other) {
    const fb = typeof other === 'function' ? other(this.value) : other;
    if (fb.isNone()) {
        logger(`Some.let => none(${name})`);
    }
    return fb.map(b => ({ ...this.value, [name]: b }));
};

Some.prototype.pick = function (name) {
    return this.map(scope => scope[name]);
};



export const scopeOption = () => some({});

/**
 *  type test
 */
// export const _v1 = scopeOption()
//     .let('a', some(1))
//     .let('b', s => some(s.a + 2))
//     .let('c', some(3))
//     .let('d', some('result: '))
//     .map(({ a, c, d }) => `${d} ${a + c}`);


// const mkT =
//     <T>(p: Promise<T>) => new Task(() => p);
// const mkR =
//     <T>(a: T) => mkT(Promise.resolve(a));

// export const _v3 = scopeTask()
//     .let('a', mkR(1))
//     .let('b', s => mkR(s.a + 1))
//     .map(({ a, b }) => `${a} => ${b}`);

logger('loaded');


import * as uuid from 'uuid';
import { Tuple } from "fp-ts/lib/Tuple";
import { findFirst, cons } from "fp-ts/lib/Array";
import { DIV } from './dom';

export type Role =
    | 'player'
    | 'master';

export interface User {
    id: string;
    role: Role;
}

export const player =
    (): User => ({
        id: uuid.v4(),
        role: 'player',
    })

export const master =
    (): User => ({
        id: uuid.v4(),
        role: 'master',
    })

type UserT = Tuple<string, HTMLElement>;

const createUser =
    (id: string): UserT => {
        const elem = DIV({ 'class': 'user' })
        document.body.appendChild(elem)
        return new Tuple([id, elem])
    };

export const createUsers =
    () => {
        let users: UserT[] = [];

        const getUserT =
            (id: string): UserT => findFirst((u: UserT) => u.fst() === id)(users).fold(
                () => {
                    users = cons(createUser(id))(users);
                    return getUserT(id);
                },
                u => u
            );

        const getUser =
            (id: string) => getUserT(id).snd();

        const userDo =
            (id: string) =>
                (f: (h: HTMLElement) => void) =>
                    f(getUser(id));

        const allDo =
            (f: (h: HTMLElement) => void) => users.map(u => u.snd()).map(f);

        return { userDo, allDo };
    }
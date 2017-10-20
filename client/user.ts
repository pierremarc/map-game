
import * as uuid from 'uuid';

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
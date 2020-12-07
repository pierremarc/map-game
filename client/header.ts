import { DIV, H1, TEXT } from './dom';


export const renderHeader = (mapName: string) => {
    document.body.append(
        DIV({ class: 'header' },
            H1({ class: 'map-name' }, TEXT(mapName))))
}

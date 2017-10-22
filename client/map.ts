import * as uuid from 'uuid';
import { DIV, style, absolute } from './dom';
import { createStream } from './stream';
import { Map, View, layer, source, proj } from 'openlayers';

const coords =
    (ev: MouseEvent) => ({
        x: ev.clientX,
        y: ev.clientY,
    });

const brussels = proj.fromLonLat([4.35, 50.85]);

const mapOptions: olx.MapOptions = {
    layers: [
        new layer.Tile({
            preload: 4,
            source: new source.OSM()
        })
    ],
    view: new View({
        center: brussels,
        zoom: 13
    })
};

export const createMap =
    (user: string) => {
        const root = DIV({ 'class': 'map' });
        const move = createStream<'move'>();
        const olMap = new Map(mapOptions);

        style(root, {
            ...absolute(),
            zIndex: '1',
            backgroundColor: 'blue',
        });

        document.body.appendChild(root);
        olMap.setTarget(root);

        root.addEventListener('mousemove', ev => {
            const pixel = olMap.getEventPixel(ev);
            const coordinates = olMap.getCoordinateFromPixel(pixel);
            move.feed({
                user,
                id: uuid.v4(),
                type: 'move',
                data: {
                    x: coordinates[0],
                    y: coordinates[1],
                }
            })
        }
        );

        return { move, olMap };
    }
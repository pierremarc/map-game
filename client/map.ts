import * as uuid from 'uuid';
import { DIV, style, absolute, addClass, removeClass } from './dom';
import { createMessageStream } from './stream';
import { Map, View, layer, source, proj, Overlay, MapBrowserEvent } from 'openlayers';
import { Option, fromNullable } from 'fp-ts/lib/Option';
import { Message, SelectData } from '../lib/io';


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

const coords =
    (m: Map) =>
        (ev: MouseEvent) =>
            m.getCoordinateFromPixel(m.getEventPixel(ev));

export const createMap =
    (user: string, getS: () => Option<Message<"select">>) => {
        const root = DIV({ 'class': 'map' });
        const move = createMessageStream<'move'>();
        const drop = createMessageStream<'drop'>();
        const olMap = new Map(mapOptions);
        const getCoords = coords(olMap);

        style(root, {
            ...absolute(),
            zIndex: '1',
            backgroundColor: 'blue',
        });

        document.body.appendChild(root);
        olMap.setTarget(root);

        const addOverlay =
            (id: string, element: HTMLElement, coords: ol.Coordinate) => {
                const popup = new Overlay({
                    id,
                    element,
                    // positioning: 'center-center',
                    // stopEvent: false,
                });
                popup.setPosition(coords);
                popup.setPositioning('center-center');
                olMap.addOverlay(popup);
                olMap.render();
            }

        const selectItem =
            (id: string) => {
                olMap.getOverlays().forEach(o => removeClass(o.getElement(), 'selected'));
                fromNullable(olMap.getOverlayById(id))
                    .map(o => fromNullable(o.getElement())
                        .map(e => addClass(e, 'selected')))
            }
        root.addEventListener('mousemove', ev => {
            const coordinates = getCoords(ev);
            move.feed({
                user,
                id: uuid.v4(),
                type: 'move',
                data: {
                    x: coordinates[0],
                    y: coordinates[1],
                }
            })
        }, false);

        olMap.on('click', (ev: MapBrowserEvent) => {
            // root.addEventListener('click', (ev) => {
            // const coordinates = getCoords(ev);
            const coordinates = ev.coordinate;
            getS().map(m => drop.feed({
                user,
                id: uuid.v4(),
                type: 'drop',
                data: {
                    x: coordinates[0],
                    y: coordinates[1],
                    item: (m.data as SelectData).item,
                }
            }));
        });

        return { move, drop, olMap, addOverlay, selectItem };
    }
import { DIV, H1, TEXT, TEXTAREA, register, DETAILS, SUMMARY, INPUT, registerT, A, SPAN, BR } from "./dom"


export const layout = () => {
    const mapTitle = register('title', H1({ class: 'map-title' }))

    const headerLinks = DIV({ class: 'header-links' },
        DIV({ 'class': 'log-link' }, A({
            href: document.URL
        }, TEXT('map permalink'))),
        DIV({ 'class': 'log-link' }, A({
            href: document.URL + '.geojson'
        }, TEXT('download map data'))),
        DIV({ 'class': 'log-link' }, A({ 'href': '#' }, TEXT('documentation'))),
    )

    const header = DIV({ class: 'header' },
        DIV({ 'class': 'header-logo' }, A({ href: '/' }, TEXT('map-log'))),
        mapTitle,
        headerLinks
    )


    const map = DIV({ 'class': 'map-wrapper' },
        register('map', DIV({ id: 'map', 'class': 'map' })));

    const items = DIV({ 'class': 'items' },
        TEXT('Annotate the map,'),
        BR({}),
        TEXT('pick a sticker : '),
        register('items', DIV({ 'class': 'item-list' }, register('deselect', DIV({ 'class': 'deselect', 'title': 'deselect' }, TEXT('+'))))),
    );

    const itemForm = DETAILS({ 'class': 'create-item' }, SUMMARY({}, TEXT('Add a sticker to the list')),
        DIV({ 'class': 'widget-title' }, TEXT('Upload an image to add a new sticker to the list (.jpg or .png).')),
        DIV({ 'class': 'create-step' }, TEXT('1')),
        registerT('item-file', INPUT({ 'type': 'file' })),
        DIV({ 'class': 'create-step' }, TEXT('2')),
        registerT('item-name', INPUT({ 'type': 'text', 'placeholder': 'give it a name' })),
        DIV({ 'class': 'create-step' }, TEXT('3')),
        register('item-submit', DIV({ 'class': 'btn btn--submit' }, TEXT('Create sticker'))),
    )

    const commentForm = DETAILS({ 'class': 'comment-item' }, SUMMARY({}, TEXT('Comment the map')),
        DIV({ 'class': 'form' },
            DIV({ 'class': 'widget-desc' }, TEXT('Select a sticker on the map, and write a comment below')),
            registerT('text-input', TEXTAREA({ 'rows': '4' })),
            register('text-submit', DIV({ 'class': 'btn btn--submit' }, TEXT('Submit comment'))),
        ),
    )

    const text = DIV({ 'class': 'text' },
        commentForm,
        register('text-list', DIV({ 'class': 'list' })),

    )

    const footer = DIV({ 'class': 'footer' },
        SPAN({}, TEXT('Alpha Version - Developped in Brussels by '),
            A({ 'href': 'https://atelier-cartographique.be' }, TEXT('atelier cartographique')),
            TEXT(' - Basemap ©'),
            A({ 'href': 'https://www.openstreetmap.org/copyright/en' }, TEXT('OpenStreetMap Contributors')))
    )

    const itemsWrapper = DIV({ 'class': 'items-wrapper' },
        items,
        itemForm,
    )

    const main = DIV({ 'class': 'main' },
        itemsWrapper,
        map,
        text
    )

    document.body.appendChild(
        DIV({ 'class': 'viewport log' },
            header,
            main,
            footer
        ))
}
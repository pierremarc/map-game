import { DIV, H1, TEXT, TEXTAREA, register, DETAILS, SUMMARY, INPUT, registerT, A, SPAN, BR, H2 } from "./dom"


export const layout = () => {
    const mapTitle = register('title', H1({ class: 'map-title' }))

    const headerLinks = DIV({ class: 'header-links' },
        DIV({ 'class': 'log-link' }, A({
            href: document.URL
        }, TEXT('map permalink'))),
        DIV({ 'class': 'log-link' }, A({
            href: document.URL + '.geojson'
        }, TEXT('download map data'))),
        DIV({ 'class': 'log-link' }, A({ 'href': 'https://github.com/pierremarc/map-game/blob/master/documentation/maplog.md' }, TEXT('documentation'))),
    )

    const header = DIV({ class: 'header' },
        DIV({ 'class': 'header-logo' }, A({ href: '/' }, TEXT('map-log'))),
        mapTitle,
        headerLinks
    )


    const map = DIV({ 'class': 'map-wrapper' },
        register('map', DIV({ id: 'map', 'class': 'map' })));

    const items = DIV({ 'class': 'items' },
        H2({},
            TEXT('Annotate the map,'),
            BR({}),
            TEXT('pick a sticker')),
        register('items', DIV({ 'class': 'item-list' }, register('deselect', DIV({ 'class': 'deselect', 'title': 'deselect' }, TEXT('+'))))),
    );

    const itemForm = DETAILS({ 'class': 'create-item' }, SUMMARY({}, TEXT('Add a new sticker')),
        DIV({ 'class': 'widget-title' },
            TEXT('Upload an image that will be used as a sticker (.jpg , .png, .svg).'),
            ),
        DIV({ 'class': 'widget-title' },
            TEXT('Need pictos ? '),
            A({ 'href': 'https://atelier-cartographique.be/storage/pictos/picto-list.html', 'target':'_blank' }, TEXT('Click here.'))),
        DIV({ 'class': 'create-step' }, 
            DIV({ 'class': 'create-step__number' }, TEXT('1')),
            registerT('item-file', INPUT({ 'type': 'file' })),
        ),
        DIV({ 'class': 'create-step' }, 
            DIV({ 'class': 'create-step__number' }, TEXT('2')),
            registerT('item-name', INPUT({ 'type': 'text', 'placeholder': 'give it a name' })),
        ),
        DIV({ 'class': 'create-step' }, 
            DIV({ 'class': 'create-step__number' }, TEXT('3')),
            register('item-submit', DIV({ 'class': 'btn btn--submit' }, TEXT('Create sticker'))),
        ),
    )

    const feedback = DIV({ 'class': 'feedback' },
        TEXT('Do you need help ? '),
        TEXT('Willing to contribute or give a feedback ?'),
        TEXT('Your map has to be cleaned-up ? '),
        TEXT('Or you want it being connected to '),
        A({ 'href': 'https://cartofixer.be/', 'target': '_blank' }, TEXT('cartofixer')),
        TEXT(' ? '),
        TEXT('Please '),
        A({ 'href': 'https://atelier-cartographique.be/en/contact.html', 'target': '_blank' }, TEXT('contact us.'))
    )

    const commentForm = DIV({ 'class': 'comment-item' },
        H2({}, TEXT('Comment a sticker')),
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
        feedback,
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
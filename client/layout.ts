import { DIV, H1, TEXT, TEXTAREA, register, DETAILS, SUMMARY, INPUT, registerT } from "./dom"



export const layout = () => {
    const header = DIV({ class: 'header' },
        register('title', H1({ class: 'map-name' })))

    const map = register('map', DIV({ id: 'map', 'class': 'map' }));

    const items = DIV({ 'class': 'items' },
        TEXT('Annotate the map, pick a sticker :'),
        register('items', DIV({ 'class': 'item-list' })));

    const itemForm = DETAILS({ 'class': 'create-item' }, SUMMARY({}, TEXT('Add a sticker to the list')),
        DIV({ 'class': 'widget-title' }, TEXT('Upload an image to add a new sticker to the list (.jpg or .png).')),
        DIV({ 'class': 'create-step' }, TEXT('1')),
        registerT('item-file', INPUT({ 'type': 'file' })),
        DIV({ 'class': 'create-step' }, TEXT('2')),
        register('item-name', INPUT({ 'type': 'text', 'placeholder': 'give it a name' })),
        DIV({ 'class': 'create-step' }, TEXT('3')),
        register('item-submit', DIV({ 'class': 'btn btn--submit' }, TEXT('Create sticker'))),
    )

    const text = DIV({ 'class': 'text' },
        register('text-list', DIV({ 'class': 'list' })),
        DIV({ 'class': 'form' },
            DIV({ 'class': 'widget-title' }, TEXT('Comment the map')),
            DIV({ 'class': 'widget-desc' }, TEXT('Select a sticker on the map, and write a comment below')),
            registerT('text-input', TEXTAREA({ 'rows': '4' })),
            register('text-submit', DIV({ 'class': 'btn btn--submit' }, TEXT('Submit comment'))),
        ),
    )
    document.body.appendChild(
        DIV({ 'class': 'viewport' },
            header,
            items,
            map,
            itemForm,
            text,
        ))
}
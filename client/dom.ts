import { fromNullable, Option } from "fp-ts/lib/Option";

export const isKeyCode =
    (kc: KeyCode) => (event: KeyboardEvent) => {
        return kc === event.which || kc === event.keyCode;
    }

export enum KeyCode {
    BACKSPACE = 8,
    TAB = 9,
    ENTER = 13,
    SHIFT = 16,
    CTRL = 17,
    ALT = 18,
    PAUSE = 19,
    CAPS_LOCK = 20,
    ESCAPE = 27,
    SPACE = 32,
    PAGE_UP = 33,
    PAGE_DOWN = 34,
    END = 35,
    HOME = 36,
    LEFT_ARROW = 37,
    UP_ARROW = 38,
    RIGHT_ARROW = 39,
    DOWN_ARROW = 40,
    INSERT = 45,
    DELETE = 46,
    KEY_0 = 48,
    KEY_1 = 49,
    KEY_2 = 50,
    KEY_3 = 51,
    KEY_4 = 52,
    KEY_5 = 53,
    KEY_6 = 54,
    KEY_7 = 55,
    KEY_8 = 56,
    KEY_9 = 57,
    KEY_A = 65,
    KEY_B = 66,
    KEY_C = 67,
    KEY_D = 68,
    KEY_E = 69,
    KEY_F = 70,
    KEY_G = 71,
    KEY_H = 72,
    KEY_I = 73,
    KEY_J = 74,
    KEY_K = 75,
    KEY_L = 76,
    KEY_M = 77,
    KEY_N = 78,
    KEY_O = 79,
    KEY_P = 80,
    KEY_Q = 81,
    KEY_R = 82,
    KEY_S = 83,
    KEY_T = 84,
    KEY_U = 85,
    KEY_V = 86,
    KEY_W = 87,
    KEY_X = 88,
    KEY_Y = 89,
    KEY_Z = 90,
    LEFT_META = 91,
    RIGHT_META = 92,
    SELECT = 93,
    NUMPAD_0 = 96,
    NUMPAD_1 = 97,
    NUMPAD_2 = 98,
    NUMPAD_3 = 99,
    NUMPAD_4 = 100,
    NUMPAD_5 = 101,

    NUMPAD_6 = 102,
    NUMPAD_7 = 103,
    NUMPAD_8 = 104,
    NUMPAD_9 = 105,
    MULTIPLY = 106,
    ADD = 107,
    SUBTRACT = 109,
    DECIMAL = 110,
    DIVIDE = 111,
    F1 = 112,
    F2 = 113,
    F3 = 114,
    F4 = 115,
    F5 = 116,
    F6 = 117,
    F7 = 118,
    F8 = 119,
    F9 = 120,
    F10 = 121,
    F11 = 122,
    F12 = 123,
    NUM_LOCK = 144,
    SCROLL_LOCK = 145,
    SEMICOLON = 186,
    EQUALS = 187,
    COMMA = 188,
    DASH = 189,
    PERIOD = 190,
    FORWARD_SLASH = 191,
    GRAVE_ACCENT = 192,
    OPEN_BRACKET = 219,
    BACK_SLASH = 220,
    CLOSE_BRACKET = 221,
    SINGLE_QUOTE = 222
}

const uniq =
    <T>(xs: T[]) => Array.from(new Set(xs));

// DOM

export interface Attributes {
    [k: string]: string;
}


export const absolute =
    (top = px(0), right = px(0), bottom = px(0), left = px(0)): Partial<CSSStyleDeclaration> =>
        ({ position: 'absolute', top, right, bottom, left });

export const attribute =
    <T extends HTMLElement>(elem: T, attrs: Attributes) => {
        Object.keys(attrs)
            .forEach((k) => {
                elem.setAttribute(k, attrs[k]);
            });
        return elem;
    }

export const style =
    <T extends HTMLElement>(elem: T, attrs: Partial<CSSStyleDeclaration>) => {
        Object.keys(attrs)
            .map(k => k as keyof CSSStyleDeclaration)
            .forEach((k) => fromNullable(attrs[k])
                .map(v => {
                    elem.style.setProperty(k.toString(), v.toString());
                }));
        return elem;
    }

const createElement =
    <T extends HTMLElement>(tagName: string, attrs: Attributes, ...children: HTMLElement[]): T => {
        const root = attribute(document.createElement(tagName) as T, attrs);
        children.forEach(c => root.appendChild(c));
        return root;
    };

const factory =
    <T extends HTMLElement>(tagName: string) =>
        (attrs: Attributes = {}, ...children: HTMLElement[]) =>
            createElement<T>(tagName, attrs, ...children);

export const TEXT =
    (content: string) => {
        const span = SPAN();
        span.appendChild(document.createTextNode(content));
        return span;
    }

export const DIV = factory<HTMLDivElement>('div');

export const DETAILS = factory<HTMLDetailsElement>('details');

export const SUMMARY = factory<HTMLElement>('summary');

export const SPAN = factory<HTMLSpanElement>('span');

export const A = factory<HTMLAnchorElement>('a');

export const INPUT = factory<HTMLInputElement>('input');

export const TEXTAREA = factory<HTMLTextAreaElement>('textarea');

export const CANVAS = factory<HTMLCanvasElement>('canvas');

export const IMG = factory<HTMLImageElement>('img');

export const LABEL = factory<HTMLLabelElement>('label');

export const I = factory<HTMLLIElement>('i');

export const H1 = factory<HTMLHeadingElement>('h1');
export const H2 = factory<HTMLHeadingElement>('h2');

export const BR = factory<HTMLElement>('br');


export const appendText = (text: string) => (node: Element) => {
    return node.appendChild(document.createTextNode(text));
}


export function addClass(elem: Element, c: string) {
    const ecStr = elem.getAttribute('class');
    const ec = ecStr ? ecStr.split(' ') : [];
    ec.push(c);
    elem.setAttribute('class', uniq(ec).join(' '));
}

export function toggleClass(elem: Element, c: string) {
    const ecStr = elem.getAttribute('class');
    const ec = ecStr ? ecStr.split(' ') : [];
    if (ec.indexOf(c) < 0) {
        addClass(elem, c);
    }
    else {
        removeClass(elem, c);
    }
}

export function hasClass(elem: Element, c: string) {
    const ecStr = elem.getAttribute('class');
    const ec = ecStr ? ecStr.split(' ') : [];
    return !(ec.indexOf(c) < 0)
}

export function removeClass(elem: Element, c: string) {
    const ecStr = elem.getAttribute('class');
    const ec = ecStr ? ecStr.split(' ') : [];
    elem.setAttribute('class', ec.filter(cc => cc !== c).join(' '));
}

export function emptyElement(elem: Node) {
    while (elem.firstChild) {
        removeElement(elem.firstChild);
    }
    return elem;
}

export function removeElement(elem: Node, keepChildren = false) {
    if (!keepChildren) {
        emptyElement(elem);
    }
    const parent = elem.parentNode;
    const evt = document.createEvent('CustomEvent');
    if (parent) {
        parent.removeChild(elem);
    }
    evt.initCustomEvent('remove', false, false, null);
    elem.dispatchEvent(evt);
    return elem;
}


interface Detail {
    'item-file': HTMLInputElement,
    'item-name': HTMLInputElement,
    'text-input': HTMLTextAreaElement,
}

interface Generic {
    [k: string]: HTMLElement,
}


const genericRegisteredElements: Generic = {};
const detailedRegisteredElements: Partial<Detail> = {};

export const register = (
    name: string,
    el: HTMLElement,
) => {
    if (name in genericRegisteredElements) {
        throw (new Error(`${name} is already registered, you askin for pain`))
    }
    genericRegisteredElements[name] = el;
    return el
}


export const getRegistered = (
    name: string
) => fromNullable(genericRegisteredElements[name]);


export const registerT = <K extends keyof Detail>(
    name: K,
    el: Detail[K],
) => {
    if (name in detailedRegisteredElements || name in genericRegisteredElements) {
        throw (new Error(`${name} is already registered, you askin for pain`))
    }
    genericRegisteredElements[name as string] = el as HTMLElement;
    detailedRegisteredElements[name] = el;
    return el
}


export const getRegisteredT = <K extends keyof Detail>(
    name: K
) => fromNullable(detailedRegisteredElements[name]) as Option<Detail[K]>;






export function px(val = 0) {
    return `${val.toString()}px`;
}



declare module 'FORUM' {
    let FORUM: {
        editor: MybbEditor
    }

    export class MybbEditorTag {
        /**
         * @param {string} name Строка, название кнопки.
         */
        name: string;

        /**
         * @param {function} onclick Функция, которая будет вызвана при нажатии кнопки.
         */
        onclick: () => void;
    }

    export type MybbEditorSettings = {
        autofocus: string
    }

    export type MybbEditor = {
        settings: MybbEditorSettings;
        [key: string]: MybbEditorTag | MybbEditorSettings;
    }

    export function quote(e: string, t: string, i: string): void;

    export function bbcode(tagStart: string, tagEnd: string): void;

    export function changeVisibility(areaName: string): void;

    export function insert(value: string): void;

    export function smile(emote: string): void;

    export function tag_table(rows: number, columns: number): void;

    export function MYBB_vsi(element: HTMLElement, event: any): void;

    export function insertUploadedImage(element: HTMLElement | JQuery): void;

    export function tag_spoiler(spoilerType: string): void;

    export function keyboard(character: string): void;

    export function to(target: string): void;

    export class MYBB_vsc {
        cH: any;
        RG: { [key: string]: MYBB_vsc_item };
        checkHost: (hostingItem: MYBB_vsc_item, input: string) => boolean;
        clickHost: (element: HTMLAnchorElement) => void;
        parse: () => void;
        isLink: (input: string) => boolean;
        message: (html: string) => void;
        reInit: () => void;
    }

    type MYBB_vsc_item = {
        l: "0" | "1";
        t: string;
        x: RegExp;
        nf: string;
    }
}
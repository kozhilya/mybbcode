
export type AdapterCallback = (container: JQuery) => void;

export type TagCallback = (elem: JQuery,
                           selector: string,
                           set_html: string | boolean) => void;

export type AuthorEditorCallback = (container: JQuery) => void;

export type EventResolver = (e: any) => JQuery
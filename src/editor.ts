export class Editor {
    /**
     * Порядок отображения кнопок формы ответа.
     */
    buttons: string[] = null;

    /**
     * Массив из 2 значений, которые являются HTML-кодами, что будут добавлены до и после списка кнопок.
     * @type {string[]}
     */
    wrapper: string[] = ['<table><tr>', '</tr></table>'];

    /**
     * Метод для генерации кнопок.
     * @param {string} key Название кода, ключ объекта `FORUM.editor`.
     * @param value Набор правил кода, соответствующее ключу key значения объекта `FORUM.editor[key]`.
     */
    generator(key: string, value: any): string {
        return `<td class="form-buttons-button" id="button-${key}" title="${value.name}"><img onclick="FORUM.get(&quot;editor.${key}.onclick()&quot;)" src="/i/blank.gif" alt="&nbsp;" /></td>`;
    }

    /**
     * Дополнительные элементы, которые могут быть добавлены наряду с другими формы ответа
     * @type {Object.<string, string>}
     */
    specials: {[key: string] : string} = {
        '|': '<td class="form-buttons-splitter">&nbsp;</td>',
        '~': '<td class="form-buttons-filler">&nbsp;</td>',
        '\n': '</tr><tr>',
    };
}
import {AdapterCallback, AuthorEditorCallback, EventResolver, TagCallback} from "./types";
import {FORUM, MybbEditorTag} from "./mybb-editor";
import {Editor} from "./editor";

export default class MybbCode {
    /**
     * Текст, который будет установлен при вызове `set_html(false)` в обработчиках тегов,
     * добавленных при помощи метода `addTag`.
     * @type loadingText {string}
     * @see addTag
     */
    loadingText = '\u0421\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F...';

    /**
     * Набор тегов
     */
    private tags: {[key: string]: TagCallback} = {};

    /**
     * Набор адаптеров
     */
    private adapters: AdapterCallback[] = [];

    /**
     * Набор обработчиков столбца автора
     */
    private authorEditors: AuthorEditorCallback[] = [];

    /**
     * Выделение контейнеров сообщений для событий
     */
    events: {[key: string]: EventResolver} = {
        'pun_preview': (_) => $('#post-preview .post-content'),
        'pun_post': (_) => $('.topic .new-ajax .post-content'),
        'pun_edit': (e) => $(e.sender),
        'pun_main_ready': (_) => $('.post-content'),
        'spoiler.firstOpen': (e) => $(e.sender).parent().find('blockquote').eq(0)
    };

    /**
     * Набор правил для генерации кнопок формы ответа. Удаление полей настоятельно не рекомендуется.
     */
    editor: Editor = new Editor();

    /**
     * Конструктор класса `MyBBCode`.
     */
    constructor() {
        $(document).on(Object.keys(this.events).join(' '), (event) => {
            const blocks = this.events[event.type](event);

            this.processPostContents(blocks);
        });

        if (FORUM.editor) {
            this.editor.buttons = Object.keys(FORUM.editor).filter((v) => v !== 'settings');
            $(document).on('pun_main_ready', () => this.generateEditorButtons());
        }
    }

    /**
     * Добавление нового события, который будет запускать обработчики сообщений и обработчики пользовательских кодов.
     * @param {string} name Отслеживаемое DOM-событие, используемое методом `jQuery.on(name)`, и которое можно
     *                      вызвать методом `jQuery.trigger(name)`.
     * @param {EventResolver} resolver Это должна быть функция, которые на основе объекта события (`event`, он
     *                                 подаётся на вход этой функции), определяет, какие контейнеры должны быть
     *                                 обработаны обработчиками.
     */
    registerEvent(name: string, resolver: EventResolver): void {
        $(document).on(name, (event) => this.processPostContents(resolver(event)));
    }

    /**
     * Установка HTML загружающегося тега.
     * @param {JQuery} elem Цель установки
     * @param {string|false} html HTML-код для установки
     */
    private setHtml(elem: JQuery, html: string|false): void {
        if (html === false) {
            elem.html(this.loadingText).addClass('loading');
        }
        else {
            elem.html(html).removeClass('loading');
        }
    }

    /**
     * Обработка контейнера сообщения всеми зарегистрированными обработчиками.
     * @param containers jQuery-объект, ссылающийся на контейнер (или контейнеры), который содержит необработанное сообщение.
     */
    private processPostContents(containers: JQuery): void {
        containers.each((_, container) => {
            const $container = $(container);

            $.each(this.tags, (tag, action) => {
                $('.custom_tag_' + tag, $container).each((i, elem) => {
                    const $elem = $(elem);

                    let id = $elem.prop('id') || (tag + '-' + i);

                    if ($elem.hasClass('processed')) {
                        return;
                    }

                    action($elem, '.custom_tag_' + tag + '#' + id, this.setHtml.bind(this, $elem));

                    $elem.addClass('processed');
                });
            });

            $.each(this.adapters, (i, action) => {
                action($container);
            });

            if ($container.hasClass('post-content')) {
                const ul = $container.parents('.post').find('.post-author ul');

                if (!ul.hasClass('mybbcode-processed')) {
                    $.each(this.authorEditors, (i, action) => {
                        action(ul);
                    });

                    ul.addClass('mybbcode-processed')
                }
            }
        });
    }

    /**
     * Добавление обработчиков пользовательских тегов, добавленных через систему пользовательских тегов
     * (/admin_forms.php — "Пользовательские bb-теги"). Для корректной работы обработчика рекомендуется
     * (но НЕ необходимо) указать для тега флаг `u` (unique).
     * @param {string} name Строка, название тега. Должно совпадать с названием тега в поле "Пользовательские bb-теги".
     * @param {TagCallback} callback Функция, которая будет вызываться по событию.
     */
    addTag(name: string, callback: TagCallback): void {
        if (this.tags[name]) {
            console.warn('[MyBBCode] Tag "' + name + '" declared more than one time!');
        }

        this.tags[name] = callback;
    }

    /**
     * Добавление общих обработчиков, которые будут применяться к сообщениям.
     * @param {AdapterCallback} callback
     */
    addAdapter(callback: AdapterCallback): void {
        this.adapters.push(callback);
    }

    /**
     * Добавление обработчика, изменяющего столбец автора сообщения.
     * После обработки, к ul-элементу будет добавлен класс `mybbcode-processed`; если элемент имеет этот класс,
     * обработчик не будет применён.
     * @param {AuthorEditorCallback} callback
     */
    addAuthorEditor(callback: AuthorEditorCallback): void {
        this.authorEditors.push(callback);
    }

    /**
     * Сгенерировать кнопку
     * @param {string} key id кнопки
     * @returns {string} Код кнопки
     */
    private generateEditorButton(key: string): string {
        if (!FORUM.editor) {
            return '';
        }

        if (key in this.editor.specials) {
            return this.editor.specials[key]
        }

        if (key in FORUM.editor) {
            const value = FORUM.editor[key];
            return this.editor.generator(key, value);
        }

        return '';
    }

    /**
     * Сгенерировать заново строку с кнопками редактора.
     */
    generateEditorButtons(): void {
        if (!FORUM.editor || (this.editor.buttons === null)) {
            return;
        }

        const old = Object.keys(FORUM.editor).filter((v) => v !== 'settings');
        let changed = old.length !== this.editor.buttons.length;
        for (let i = 0; !changed && (i < old.length); i++) {
            changed = changed || (old[i] !== this.editor.buttons[i]);
        }

        if (!changed) {
            return;
        }

        let result = this.editor.wrapper[0];

        for (const key of this.editor.buttons) {
            result += this.generateEditorButton(key);
        }

        result += this.editor.wrapper[1];

        $('#form-buttons').empty().html(result);
    }

    /**
     * Добавление кнопки формы.
     * После объявления при помощи этого метода, объект `data` будет доступен после объявления как `FORUM.editor.key`.
     * @param {string} key Идентификатор кнопки, который будет добавлен к `td.button#button-key`.
     * @param {MybbEditorTag} data Данные поля, которые будут использоваться стандартными скриптами.
     * Этому объектов можно указать и другие поля, однако указанные обязательны.
     * @param {string} data.name Строка, название кнопки.
     * @param {function} data.onclick Функция, которая будет вызвана при нажатии кнопки.
     * @param {number|string|false} [before] Указание, перед каким элементом необходимо добавить кнопку. Допустимые значения:
     * Число `i` — тогда кнопка будет добавлена перед `i`-м элементом массива `MyBBCode.editor.buttons`.
     * Строкой-идентификатором кнопки `key` — тогда новая кнопка будет помещена перед кнопкой с идентификатором `key`.
     */
    addEditorButton(key: string, data: MybbEditorTag, before: number|string|false = false): void {
        if (!('FORUM' in window) || !('editor' in FORUM)) {
            return null;
        }

        if (!(key in this.editor.specials)) {
            FORUM.editor[key] = data;
        }

        if (this.editor.buttons !== null) {
            let index: number|false;

            if (before === false) {
                index = false;
            }
            else if (typeof before === "string") {
                index = this.editor.buttons.indexOf(before);
                index = (index < 0) ? false : index;
            }
            else if ((typeof before === "number") && (before >= 0) && (before < this.editor.buttons.length)) {
                index = before;
            }
            else {
                index = false;
            }

            if (index === false) {
                this.editor.buttons.push(key);
            }
            else {
                this.editor.buttons.splice(index, 0, key);
            }
        }
    }

}
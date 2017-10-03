define([
    'backbone',
    'underscore',
    'text!app/helper/modal/template.html'
], function (Backbone, _, html) {
    /*
    <div class="modal modal-in">
        <div class="modal-inner">
            12312
        </div>
        <div class="modal-buttons">
            <span class="modal-button">Cancel</span>
            <span class="modal-button">OK</span>
        </div>
    </div>
     */

    /**
     * @type {{title: string, text: string}}
     */
    var DEFAULT_MODAL_PARAMS = {
        title: '',
        text: ''
    }
    /**
     * @type {{text: string, bold: boolean, onClick: onClick}}
     */
    var DEFAULT_BUTTON_PARAMS = {
        text: '',
        bold: false,
        onClick: function () {}
    }

    var ls = window.localStorage
    var $ = Backbone.$
    var template = _.template(html)
    var body = $('body')
    var overlay = $('.modal-overlay')

    /**
     * @param {jQuery} modal
     */
    function openModal (modal) {
        overlay.addClass('modal-overlay-visible')

        modal
            .show()
            .css({
                marginTop: -Math.round(modal.outerHeight() / 2) + 'px'
            })
            .removeClass('modal-out')
            .addClass('modal-in')

        return modal
    }

    /**
     * @param {jQuery} modal
     */
    function closeModal (modal) {
        overlay.removeClass('modal-overlay-visible')

        modal
            .on('webkitTransitionEnd transitionend', function () {
                modal.remove()
            })
            .removeClass('modal-in')
            .addClass('modal-out')
    }

    // жесткая функциональная херня для вытягивания дефолтных параметров
    /**
     * @return {['title', 'text']}
     */
    var defaultParamKeys = function () {
        return _.keys(DEFAULT_MODAL_PARAMS)
    }
    /**
     * Метод возвращает параметы только для кнопок
     *
     * @param {Object} params
     * @return {[DEFAULT_BUTTON_PARAMS]}
     */
    var getButtonsParams = function (params) {
        var buttons = _.property('buttons')(params) || []

        return _.map(buttons, function (buttonParams) {
            return _.extend({}, DEFAULT_BUTTON_PARAMS, buttonParams)
        })
    }
    /**
     * Метод возвращает только те параметры которые относятся к модалке
     *
     * @param {Object} params
     * @return {DEFAULT_MODAL_PARAMS}
     */
    var getModalParams = function (params) {
        return _.pick(params, defaultParamKeys)
    }
    /**
     * Метод возвращает нормализованные параметры для модалки
     *
     * @param {Object} params
     * @return {Object}
     */
    var getDefaultParams = function (params) {
        return _.extend({}, DEFAULT_MODAL_PARAMS, getModalParams(params), {
            buttons: getButtonsParams(params)
        })
    }

    /**
     * Метод показывает модальное окно, на глухо слизано с Framework7
     *
     * @param {Object} confirmParams
     */
    function modal (confirmParams) {
        var params = getDefaultParams(confirmParams)
        var modal = $(template(params))

        body.append(modal)
        modal.find('.modal-button').each(function (index, el) {
            $(el).on('click', function (e) {
                if (params.buttons[ index ].close !== false) {
                    closeModal(modal)
                }

                if (params.buttons[ index ].onClick) {
                    params.buttons[ index ].onClick(modal, e)
                }
            })
        })

        return openModal(modal)
    }

    var confirm = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
            callbackCancel = arguments[ 2 ]
            callbackOk = arguments[ 1 ]
            title = undefined
        }

        return modal({
            text: text || '',
            title: title === undefined ? 'АльфаСтрахование–ОМС' : title,
            buttons: [
                {
                    text: 'Отмена',
                    bold: true,
                    onClick: callbackCancel
                },
                {
                    text: 'Отправить',
                    onClick: callbackOk,
                    close: false
                }
            ]
        })
    }

    var NUMBER_OF_STARTS_KEY = 'numberOfStarts'
    var CANCEL_COUNT_KEY = 'cancelCount'
    var MAX_SHOW_COUNT = 3

    modal.init = function () {
        // количество запусков приложения
        var numberOfStarts = parseInt(ls.getItem(NUMBER_OF_STARTS_KEY), 10) || 1
        var cancelCount = parseInt(ls.getItem(CANCEL_COUNT_KEY), 10) || 1
        // таймаут перед показом попапа
        var timeout = 3 * 1000

        // если нажали кнопку отметы более 3ёх раз
        if (cancelCount > MAX_SHOW_COUNT) {
            // то попап больше не показываем никогда
            return
        }

        // если это первый запуск
        if (numberOfStarts === 1) {
            // то таймаут будет 60 секунд
            timeout = 60 * 1000
        }

        setTimeout(function () {
            var allowSend = false
            var inner = '<p style="margin:.5em 0">Помогите нам сделать приложение лучше.</p>' +
                '<p style="margin:.5em 0">Поставьте оценку и оставьте отзыв о работе приложения.</p>' +
                '<select>' +
                '  <option value="" selected disabled hidden></option>' +
                '  <option value="1">1</option>' +
                '  <option value="2">2</option>' +
                '  <option value="3">3</option>' +
                '  <option value="4">4</option>' +
                '  <option value="5">5</option>' +
                '</select>';
            var m = confirm(
                inner,
                'Не нашли, что искали?',
                function () {
                    if (allowSend) {
                        Backbone.Events.trigger('action:review', $('select', m).val())
                        closeModal(m)
                    }
                },
                function () {
                    cancelCount += 1
                    ls.setItem(CANCEL_COUNT_KEY, cancelCount)
                }
            );
            var sendButton = $('.modal-button', m).last()
            sendButton.addClass('modal-button-disable')

            $('select', m).barrating({
                theme: 'css-stars',
                onSelect: function () {
                    allowSend = !_.isEmpty(this.$elem.val())
                    sendButton[allowSend ? 'removeClass' : 'addClass']('modal-button-disable')
                }
            });
        }, timeout)

        numberOfStarts += 1
        ls.setItem(NUMBER_OF_STARTS_KEY, numberOfStarts)
    }

    modal.neverShowAgain = function () {
        ls.setItem(CANCEL_COUNT_KEY, MAX_SHOW_COUNT + 1)
    }

    return modal
})

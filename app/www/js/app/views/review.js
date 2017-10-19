define([
    'backbone',
    'underscore',
    'store',
    'views/page',
    'text!templates/review/index.html',
    'text!templates/review/loader.html',
    'app/helper/device',
    'collections/regions',
    'app/helper/notify',
    'app/helper/modal/index'
], function (
    Backbone,
    _,
    Store,
    PageView,
    pageHTML,
    loaderHTML,
    device,
    regions,
    notify,
    modal
) {
    'use strict';

    var C_ID = 'review'

    var $ = Backbone.$
    var ajax = Backbone.ajax
    var bind = _.bind
    var each = _.each
    var isEmpty = _.isEmpty
    var ReviewModel = Backbone.Model.extend({
        defaults: {
            rating: '',
            message: '',
            contacts: ''
        },

        localStorage: new Store('ReviewModel')
    })

    if (!regions.length) {
        regions.fetch({
            reset: true
        })
    }

    return function (ratingValue) {
        var isBackClicked = false
        // по стайлгайдам академии
        // 1. геттеры/сеттеры свойств объекта
        // 2. основные методы объекта
        // 3. обработчики событий
        var pageView = new PageView({
            html: pageHTML,

            Navbar: {
                title: 'Оставить отзыв'
            },

            Page: {
                cid: C_ID,

                model: new ReviewModel({
                    id: C_ID
                }),

                events: {
                    'change form': 'onFormChange'
                },

                init: function () {
                    this.$content = this.$('.page-content')
                    this.listenTo(this.model, 'sync', bind(this.onModelFetch, this))
                    this.model.fetch()
                },

                render: function () {
                    // установим рейтинг
                    var ratingElement = this.$('#reviewRating')

                    if (!isEmpty(ratingValue)) {
                        ratingElement
                            .val(ratingValue)
                            .trigger('change')
                    }

                    ratingElement.barrating({
                        theme: 'css-stars'
                    })

                    return this
                },

                formSubmit: function () {
                    this.$('.has-error').removeClass('has-error')

                    var $rating = this.$('[name="rating"]')
                    var rating = $rating.val()

                    if (isEmpty(rating)) {
                        $rating.closest('.form-line').addClass('has-error')

                        return false
                    }

                    var region = regions.getSelected()
                    var appData = $.param({
                        operation_system: device.os,
                        region: region && region.get('name')
                    })
                    var formData = this.$('form').serialize()
                    var ajaxParams = {
                        type: 'POST',
                        url: 'https://alfastrahoms.ru/api/reviews/',
                        data: appData + '&' + formData
                    }

                    // if (!window.hasOwnProperty('cordova')) {
                    //     ajaxParams.url = '/asoms/www/'
                    // }

                    this.$content.html(loaderHTML)

                    ajax(ajaxParams)
                        .done(bind(this.onAjaxSuccess, this))
                        .fail(bind(this.onAjaxFail, this))
                        .always(bind(this.onAjaxEnd, this))

                    return true
                },

                onFormChange: function (e) {
                    var changedElement = $(e.target)
                    var name = changedElement.attr('name')
                    var value = changedElement.val()

                    this.model
                        .set(name, value)
                        .save()
                },

                onModelFetch: function () {
                    var _this = this
                    var idAttribute = this.model.idAttribute

                    // заполняем форму значениями из модели
                    each(this.model.attributes, function (value, key) {
                        if (key !== idAttribute) {
                            var currentElement = _this.$('[name="' + key + '"]')
                            var currentValue = currentElement.val()

                            if (isEmpty(currentValue)) {
                                currentElement.val(value)
                            }
                        }
                    })
                },

                onAjaxSuccess: function () {
                    var message = 'Ваша оценка и отзыв отправлены в работу<br>в службу поддержки.'

                    this.$('.loader').html(
                        '<div style="text-align:center;margin:0 5%">' +
                        '  <h1>Спасибо!</h1>' + message +
                        '</div>'
                    )

                    var model = this.model
                    var idAttribute = model.idAttribute

                    // очищаем модель
                    each(model.attributes, function (value, key) {
                        if (key !== idAttribute) {
                            model.set(key, '')
                        }
                    })

                    model.save()
                    // больше не показываем попап если отзыв отправлен
                    modal.neverShowAgain()
                },

                onAjaxFail: function () {
                    this.$('.loader').html(
                        '<div style="text-align:center">' +
                        '  <h1>Ошибка.</h1>' +
                        '  Во время отправки произошла ошибка.<br>' +
                        '  Пожалуйста, попробуйте отправить позже.' +
                        '</div>'
                    )

                    if (isBackClicked) {
                        notify.confirm({
                            message: 'Произошла ошибка при отправке отзыва',
                            buttons: ['Отложить', 'Повторить'],
                            callback: function (index) {
                                if (index > 1 || index === true) {
                                    Backbone.Events.trigger('action:' + C_ID)
                                    return true;
                                }

                                return false;
                            }
                        })
                    }
                },

                onAjaxEnd: function () {
                    this.trigger('ajaxEnd')
                }
            },

            Toolbar: {
                events: {
                    'click button': 'onClick'
                },

                onClick: function (e) {
                    e.preventDefault()

                    this.trigger('submit')
                }
            }
        });

        var initializedPage = pageView.init()

        var page = initializedPage.page
        var toolbar = initializedPage.toolbar
        var toolbarButton = toolbar.$('button')

        toolbar.on('submit', function () {
            if (page.formSubmit() === false) {
                return false
            }

            toolbar.undelegateEvents()
            toolbarButton
                .text('OK')
                .click(function (e) {
                    e.preventDefault()

                    isBackClicked = true
                    Backbone.Events.trigger('page:back')
                })
        })

        return initializedPage
    }
});

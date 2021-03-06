/*global define, $, _*/
define([
    'backbone',
    'views/page',
    'text!templates/main/main.html',
    'text!templates/main/menu-item.html',
    'app/helper/ga'
], function (
    Backbone,
    PageView,
    mainPage,
    menuItem,
    ga
) {
    'use strict';

    /* --- Menu start --- */
    var arMenu = [
        {
            "name": "Личный кабинет застрахованного",
            "icon": "lk",
            "action": "lk"
        },
        {
            "name": "Полисы",
            "icon": "policies",
            "action": "policies"
        },
        {
            "name": "Информация",
            "icon": "info",
            "action": "info"
        },
        {
            "name": "Медицинские учреждения",
            "icon": "hospital",
            "action": "hospital"
        },
        {
            "name": "Пункты выдачи полисов",
            "icon": "offices",
            "action": "offices"
        }
    ];

    var menuCollection = new Backbone.Collection(arMenu);

    var MenuItem = Backbone.View.extend({
        tagName: 'li',
        className: 'main-nav__i',
        template: _.template( menuItem ),
        events: {
            'click .main-nav__a': 'click'
        },
        click: function (e) {
            var action = this.model.get('action');

            ga.trackEvent('Click', 'Пункт меню: ' + this.model.get('name'));
            Backbone.Events.trigger('action', action);
            Backbone.Events.trigger('action:' + action);

            e.preventDefault();
        },
        render: function () {
            var params = this.model.toJSON();
            this.$el
                .html( this.template( params ) )
                .addClass('main-nav__i_' + params.icon);
            return this;
        }
    });

    var MenuList = Backbone.View.extend({
        tagName: 'ul',
        className: 'main-nav__lst',
        addItem: function (item) {
            var view = new MenuItem({model: item});
            this.$el.append( view.render().el );
        },
        render: function () {
            this.collection.each(this.addItem, this);
            return this;
        }
    });
    /* --- Menu end --- */

    /* --- Page view --- */
    var pageView = new PageView({
        html: mainPage,
        Page: {
            events: {
                'click #mainSelectRegion': 'openPageRegion',
                'click #mainSOS': 'openSOS',
                'click #mainAbout': 'openAbout'
            },
            openPageRegion: function (e) {
                ga.trackEvent('Click', 'Мой регион');
                Backbone.Events.trigger('region:select');
                e.preventDefault();
            },
            openSOS: function (e) {
                ga.trackEvent('Click', 'Мой страховой представитель');
                Backbone.Events.trigger('action:sos');
                e.preventDefault();
            },
            openAbout: function (e) {
                ga.trackEvent('Click', 'Задать вопрос');
                Backbone.Events.trigger('action:ask');
                e.preventDefault();
            },
            init: function () {
                var $sos = this.$el.find('.button__sos');

                // событие анимации кнопкт SOS
                Backbone.Events.on('page:beforeAdd', function (pageId) {
                    var isMainPage = pageId === 'main';
                    $sos[isMainPage ? 'addClass' : 'removeClass']('cbutton--effect-jagoda');
                });
                Backbone.Events.on('back', function (page) {
                    var isMainPage = page.prev === 'main';
                    $sos[isMainPage ? 'addClass' : 'removeClass']('cbutton--effect-jagoda');
                });
            },
            cid: 'main',
            render: function () {
                var menu = new MenuList({collection: menuCollection});
                this.$('#nav').html( menu.render().el );
                return this;
            }
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});

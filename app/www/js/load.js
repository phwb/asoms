/* global define, require */
define([
    'app/helper/device',
    'fastclick',
    'backbone',
    'page',
    'swipe',
    'app/helper/notify',
    'app/helper/download',
    // начальные настройки Backbone.Form
    'app/helper/formInit',
    // главные вьюшки
    'views/menu',
    'views/main',
    'app/helper/ga',
    'app/helper/modal/index',
    // то что не уходит в параметры
    'barrating'
], function (
    device,
    FastClick,
    Backbone,
    page,
    swipe,
    notify,
    checkResources,
    // начальные настройки Backbone.Form
    formInit,
    // главные вьюшки
    menu,
    pageMain,
    ga,
    modal
) {
    'use strict';

    var $ = Backbone.$
    var $body = $('body');

    // платформа на которое запущено приложение
    $('html').addClass(device.os);

    // init FastClick
    FastClick.attach(document.body);

    // рисуем левое меню
    $('.panel').html( menu.render().el );
    $('.panel-overlay').click(function (e) {
        if ($body.hasClass('with-panel')) {
            $body.removeClass('with-panel');
        }
        e.preventDefault();
    }).swipe({
        swipeLeft: function () {
            $body.removeClass('with-panel');
        }
    });

    $('.pages').swipe({
        swipeRight: function (e) {
            var $target = $(e.target);
            if ($target.closest('.map').length === 0) {
                $body.addClass('with-panel');
            }
        }
    });

    // asoms account
    ga.startTrackerWithId('UA-104339617-2', 10, function () {
        // трекаем главный экран
        ga.trackView(pageMain.page.cid)
        // разрешить сбор демографических данных
        ga.setAllowIDFACollection(true)
        // трекаем все экраны
        Backbone.Events.on('page:beforeAdd', function (pageId) {
            ga.trackView(pageId)
        })
        // трекаем экран на кнопку "назад"
        Backbone.Events.on('back', function (e) {
            if (e && e.prev) {
                ga.trackView(e.prev)
            }
        })
    })

    document.addEventListener('backbutton', function (e) {
        page.back();
        e.preventDefault();
    }, false);

    // page - вставляет в DOM страницы и анимирует их
    page.add(pageMain, function () {
        // после рендера главной страницы проверяем актуальность данных
        // и обновляем при необходимости
        checkResources(false, modal.init);
    });

    // роутером выступает собыитя бекбона
    // для навигации лучше бы использоваль бекбоновский router,
    // но я почему то решил использовать события
    Backbone.Events.on('action:main', function () {
        page.add(pageMain);
    });

    Backbone.Events.on('action:ask', function () {
        require(['views/ask'], function (pageForm) {
            page.add(pageForm);
            /*
            пример события окончания анимации

            роутер
            page.add(pageForm, function () {
                pageForm.page.trigger('pageAfterAnimation');
            });

            страница
            ...
            Page: {
                init: function () {
                    this.on('pageAfterAnimation', this.render);
                }
            }
            ...
            */
        });
    });

    Backbone.Events.on('action:lk', function () {
        require(['views/lk'], function (pageLk) {
            page.add(pageLk);
        });
    });

    Backbone.Events.on('action:about', function () {
        require(['views/about'], function (pageAbout) {
            page.add(pageAbout);
        });
    });

    Backbone.Events.on('action:sos', function () {
        require(['views/sos'], function (pageSOS) {
            page.add(pageSOS);
        });
    });

    Backbone.Events.on('action:policies', function () {
        require(['views/policies'], function (pagePolicies) {
            page.add(pagePolicies);
        });
    });

    Backbone.Events.on('policies:add', function (id) {
        require(['views/policies-add'], function (pageForm) {
            pageForm(id, function (error, formView) {
                page.add(formView);
            });
        });
    });

    Backbone.Events.on('policies:detail', function (id) {
        // используем нодовский подход, первый агрумент ошибка, потом все остальное
        require(['views/policies-detail'], function (pageDetail) {
            pageDetail(id, function (error, detailView) {
                if (error) {
                    // тут можно показать 404, но пока алерт
                    notify.alert(error);
                    return this;
                }
                page.add(detailView);
            });
        });
    });

    Backbone.Events.on('policies:check', function (enp) {
        require(['views/policies-check'], function (check) {
            check({
                enp: enp,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view, function () {
                        view.check();
                    });
                }
            });
        });
    });

    Backbone.Events.on('action:info', function () {
        require(['views/info'], function (pageInfo) {
            page.add(pageInfo);
        });
    });

    Backbone.Events.on('info:detail', function (id) {
        require(['views/info-detail'], function (detail) {
            detail({
                id: id,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view);
                }
            });
        });
    });

    Backbone.Events.on('action:hospital', function () {
        require([
            'collections/hospitals',
            'views/object-list'
        ], function (
            Hospitals,
            list
        ) {
            list({
                uid: 'hospital',
                collection: Hospitals,
                title: 'Медицинские учреждения',
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view);
                }
            });
        });
    });

    Backbone.Events.on('action:offices', function () {
        require([
            'collections/offices',
            'views/object-list'
        ], function (
            Offices,
            list
        ) {
            list({
                uid: 'offices',
                collection: Offices,
                title: 'Пункты выдачи полисов',
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view);
                }
            });
        });
    });

    Backbone.Events.on('object:detail', function (model) {
        require(['views/object-detail'], function (detail) {
            detail({
                model: model,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view);
                }
            });
        });
    });

    Backbone.Events.on('region:select', function () {
        require(['views/regions'], function (pageRegions) {
            page.add(pageRegions);
        });
    });

    Backbone.Events.on('map', function (model) {
        require(['views/object-map'], function (map) {
            map({
                model: model,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view, function () {
                        view.renderMap();
                    });
                }
            });
        });
    });

    Backbone.Events.on('action:refresh', function () {
        checkResources(true);
    });

    Backbone.Events.on('action:review', function (ratingValue) {
        require(['views/review'], function (review) {
            page.add(review(ratingValue));
        })
    });

    return true;
});

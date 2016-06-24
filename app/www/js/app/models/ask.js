/* global define, _ */
define([
    'backbone',
    'collections/regions'
], function (
    Backbone,
    regions
) {
    'use strict';

    if (!regions.length) {
        regions.fetch({reset: true});
    }

    var schema = {
        region: {
            title: 'Выберите регион',
            type: 'Select',
            validators: ['required'],
            options: []
        },
        'other-region': {
            title: 'Регион',
            type: 'Text'/*,
            editorAttrs: {
                placeholder: 'Название региона'
            }*/
        },
        policy: {
            title: 'Серия и номер полиса',
            type: 'Text'
        },
        //---------------------------
        name: {
            title: 'Имя',
            type: 'Text',
            validators: ['required']
        },
        surname: {
            title: 'Фамилия',
            type: 'Text',
            validators: ['required']
        },
        patronymic: {
            title: 'Отчество',
            type: 'Text'
        },
        'birth-date': {
            title: 'Дата рождения',
            type: 'Date'
        },
        //---------------------------
        'communication-type': {
            title: 'По какому каналу связи вам удобно получить ответ?',
            type: 'Radio',
            options: [
                {
                    val: 'Телефон',
                    label: 'Телефон'
                },
                {
                    val: 'E-mail',
                    label: 'E-mail'
                }
            ],
            validators: ['required']
        },
        phone: {
            title: 'Телефон',
            dataType: 'tel',
            type: 'Text',
            validators: ['required']
        },
        email: {
            title: 'E-mail',
            dataType: 'email',
            type: 'Text'
        },
        //---------------------------
        'ask-type': {
            title: 'Тип обращения',
            type: 'Radio',
            options: [
                {
                    val: 'Задать вопрос',
                    label: 'Задать вопрос'
                },
                {
                    val: 'Жалоба',
                    label: 'Жалоба'
                }
            ],
            validators: ['required']
        },
        question: {
            title: 'Ваше обращение',
            type: 'TextArea',
            validators: ['required']
        },
        terms1: {
            title: 'Согласие на обработку персональных данных',
            type: 'Checkboxes',
            options: [{
                val: 'Y',
                label: 'Я подтверждаю своё согласие на передачу информации в электронной форме обращения (в том числе персональных данных) по открытым каналам связи сети Интернет.'
            }],
            validators: ['required']
        },
        terms2: {
            title: '',
            type: 'Checkboxes',
            options: [{
                val: 'Y',
                label: 'Я согласен(на) использование специалистами моей медицинской документации в целях рассмотрения обращения.'
            }],
            validators: ['required']
        }
    };
    schema.region.options = regions.map(function (item) {
        var name = item.get('name');
        return {
            val: name,
            label: name
        };
    });
    schema.region.options.push({
        val: 'Другой регион',
        label: 'Другой регион'
    });

    var Ask = Backbone.Model.extend({
        schema: schema
    });

    return new Ask({
        region: schema.region.options[0].val,
        'communication-type': schema['communication-type'].options[0].val,
        'ask-type': schema['ask-type'].options[0].val
    });
});

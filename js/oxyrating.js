/*! oxyRating - v0.1 - 2014-04-29
 * http://oxygenthemes.com/oxyrating
 * Copyright (c) 2014 OxygenThemes; Licensed MIT */

(function($) {
    /**
     * oxyrating() function. 
     * 
     * @param {type} arg1 Settings or action name.
     * @param {type} arg2 Extra settings if arg1 is an action name.
     * @returns {_L6.$.fn}
     */
    $.fn.oxyrating = function(arg1, arg2, arg3) {
        "use strict";

        switch (arg1) {
            case 'set':
                var $this = $(this);
                currentElement($this);
                if (!exists())
                    return this;
                if (_data[arg2] == arg3) {
                    return this;
                }// no change done
                switch (arg2) {
                    case 'value':
                        setValue(arg2);
                        break;
                    case 'disabled':
                        $_container.toggleClass('oxyrating-disabled');
                        _data[arg2] = arg3;
                        eventsReset();
                        break;
                    case 'reset':
                        if (arg3) {
                            $('<li class="oxyrating-reset"/>').prependTo($_container);
                        }
                        else {
                            $_container.find('.oxyrating-reset').remove();
                        }
                        _data[arg2] = arg3;
                        eventsReset();
                        break;
                    case 'tooltip':
                        if (arg3) {
                            $('<li class="oxyrating-tooltip"/>').appendTo($_container);
                            setTooltip($this.val());
                        }
                        else {
                            $_container.find('.oxyrating-tooltip').remove();
                        }
                        _data[arg2] = arg3;
                        eventsReset();
                        break;
                    case 'skin':
                        var prev_skin = _data[arg2];
                        _data[arg2] = arg3;
                        $_container.removeClass('oxyrating-skin-' + prev_skin)
                                .addClass('oxyrating-skin-' + arg3);
                        break;
                    case 'tooltipTexts':
                        _data[arg2] = arg3;
                        setTooltip($this.val());
                        break;
                }
                return this;
            case 'reset':
                $(this).oxyrating('set', 'value', 0);
                return this;
            case 'destroy':
                var $this = $(this);
                currentElement($this);
                if (!exists())
                    return this;
                $_container.remove();
                return this;
        }
        var settings = $.extend({// global settings
            number: 5, // any number
            type: 'full', // full | half ( @todo percentage or % in future )
            disabled: false, // true | false
            value: null, // any number
            reset: false, // true | false
            skin: 'default', // skin name,
            tooltip: false, // true | false Enable textual representation
            tooltipTexts: ['Vote', 'Horrible :O', 'Bad :(', 'Ok!', 'Good!', 'Excellent!!!'],
            // [ Default Message, ( 1, 2, 3, ... , number ) rating texts]
            onChange: function(element, value) {
            }, // triggered when the rating changes
            onInit: function(element, data) {
            }, // triggered once the ratings data have been initiated
            onCreate: function(element, container) {
            } // triggered once the DOM has been updated to create rating markup
        }, arg1),
                $_container = null, // caching container for current element ratings
                $_el = null, // caching current element
                _data = {}; // caching options for current element

        if (typeof arg1 !== 'undefined' && ('value' in arg1)) {
            settings.value = parseFloat(arg1.value);
        }

        /**
         * Reinitiates events.
         * 
         * @returns {undefined}
         */
        function eventsReset() {
            $_container
                    .off('click', '.oxyrating-unit') // rating
                    .off('mouseenter', '.oxyrating-unit') // hovering
                    .off('mouseleave', '.oxyrating-unit') // unhovering
                    .off('click', '.oxyrating-reset'); // reset
            events();
        }

        /**
         * Sets an element as current.
         * 
         * @param {jQuery DOM object} $el Current element
         * @returns {undefined}
         */
        function currentElement($el) {
            $_el = $el;
            $_container = $el.prev('.oxyrating');
            _data = $_el.data('oxyrating');
        }

        /**
         * Checks if the plugin runs for the element.
         * 
         * @returns {boolean}
         */
        function exists() {
            return ('oxyrating' in $_el.data());
        }

        /**
         * Initialize plugin.
         * 
         * @returns {undefined}
         */
        function init() {
            var __data = {};
            if (settings.value === null) {
                __data.value = $_el.is('[value]') ? parseFloat($_el.attr('value')) : 0;
            } // if no value is specified, get value from the input element or set to 0
            __data.number = $_el.data('oxyratingNumber') || settings.number; // number
            __data.type = $_el.data('oxyratingType') || settings.type; // type
            __data.disabled = ('oxyratingDisabled' in $_el.data())
                    ? $_el.data('oxyratingDisabled') : settings.disabled; // disabled
            __data.reset = ('oxyratingReset' in $_el.data())
                    ? $_el.data('oxyratingReset') : settings.reset; // reset
            __data.skin = $_el.data('oxyratingSkin') || settings.skin; // skin
            __data.tooltip = ('oxyratingTooltip' in $_el.data())
                    ? $_el.data('oxyratingTooltip') : settings.tooltip; // tooltip
            update($.extend({}, settings, __data));
            _data.onInit($_el, _data);
            $_el.hide().change();
        }

        /**
         * Creates necessary markup.
         * 
         * @returns {undefined}
         */
        function create() {
            $_container = $('<ul class="oxyrating"/>');
            $_container.addClass('oxyrating-skin-' + _data.skin);
            var number = _data.number;
            if (_data.type == 'half') {
                number = _data.number * 2;
                $_container.addClass('oxyrating-half');
            }
            if (_data.disabled) {
                $_container.addClass('oxyrating-disabled');
            }

            var $units = $('<ul class="oxyrating-units"/>');
            for (var i = 0; i < number; i++) {
                $('<li class="oxyrating-unit"/>').appendTo($units);

            }
            // IE helpers @todo to be removed
            $units.find('li:nth-child(odd)').addClass('oxyrating-odd');
            $units.find('li:nth-child(even)').addClass('oxyrating-even');

            $units.appendTo($_container).wrap('<li/>');

            if (i > 0) {
                $_container.insertBefore($_el);
                if (_data.reset) {
                    $('<li class="oxyrating-reset"/>').prependTo($_container);
                }
            }
            if (_data.tooltip) {
                $('<li class="oxyrating-tooltip"/>').appendTo($_container);
            }
            setValue(_data.value, true);
            _data.onCreate($_el, $_container);
        }

        /**
         * Sets the tooltip text.
         * 
         * @param {type} value Rating value.
         * @returns {undefined}
         */
        function setTooltip(value) {
            if (_data.type === 'half' && (value * 10 % 10)) {
                value = (value * 2 + 1) / 2;
            }
            $_container.find('.oxyrating-tooltip')
                    .text(_data.tooltipTexts[value]);
        }

        /**
         * Sets or changes the rating value.
         * 
         * @param {float || int} value New value.
         * @param {boolean} _forceSet Whether to set the value, even when it
         * matches with the old value. Forced changes will not trigger onChange().
         * @returns {undefined}
         */
        function setValue(value, _forceSet) {
            _forceSet = _forceSet || false;
            if (value === _data.value && !_forceSet)
                return;
            if (value == 0) {
                $_container.find('.oxyrating-unit').removeClass('oxyrating-active');
            }
            else {
                var eq = (_data.type == 'half') ? value * 2 : value;
                var $currentEL = $_container.find('.oxyrating-units .oxyrating-unit:eq(' + (eq - 1) + ')');
                $currentEL.prevAll('.oxyrating-unit').addClass('oxyrating-active');
                $currentEL.addClass('oxyrating-active');
                $currentEL.nextAll('.oxyrating-unit').removeClass('oxyrating-active');
            }

            update({
                value: value
            });
            $_el.attr('value', value);
            setTooltip(value);
            if (!_forceSet)
                _data.onChange($_el, value);
        }

        /**
         * Update plugin data.
         * 
         * @param {array} new_data New data.
         * @returns {undefined}
         */
        function update(new_data) {
            _data = $.extend({}, _data, new_data);
            $_el.data('oxyrating', _data);

        }

        /**
         * Binds necessary events.
         * 
         * @returns {undefined}
         */
        function events() {
            if (!_data.disabled) {
                $_container
                        .on('click', '.oxyrating-unit', function(e) {
                            var $_this = $(this);
                            currentElement($_this.closest('.oxyrating').next());
                            var eq = $_this.index() + 1;
                            if (_data.type == 'half') {
                                eq /= 2;
                            }
                            setValue(eq);
                        }) // rating
                        .on('mouseenter', '.oxyrating-unit', function() {
                            $(this).addClass('oxyrating-hover')
                                    .prevUntil('.oxyrating-reset').addClass('oxyrating-hover');
                        }) // hovering
                        .on('mouseleave', '.oxyrating-unit', function() {
                            $(this).removeClass('oxyrating-hover')
                                    .siblings('.oxyrating-unit').removeClass('oxyrating-hover');
                        }); // unhovering

                if (_data.reset) {
                    $_container.on('click', '.oxyrating-reset', function() {
                        var $_this = $(this);
                        currentElement($_this.parent().next());
                        setValue(0);
                    }); // reset
                }
            }
        }

        /**
         * Run the plugin.
         */
        this.each(function() {
            $_el = $(this);
            init();
            create();
            events();
            return this;
        });
    };
})(jQuery);
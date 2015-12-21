

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define([ 'jquery', 'exports'], function($, exports) {
      root.rangepicker = factory(root, exports, $);
    });

  } else if (typeof exports !== 'undefined') {
      var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;  //isomorphic issue
      if (!jQuery) {
          try {
              jQuery = require('jquery');
              if (!jQuery.fn) jQuery.fn = {}; //isomorphic issue
          } catch (err) {
              if (!jQuery) throw new Error('jQuery dependency not found');
          }
      }

    factory(root, exports, jQuery);

  // Finally, as a browser global.
  } else {
    root.rangepicker = factory(root, {}, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this || {}, function(root, rangepicker, $) { // 'this' doesn't exist on a server

    var RangePicker = function(element, options, cb) {

        //default settings for options
        this.parentEl = 'body';
        this.element = $(element);
        this.startRange = null;
        this.endRange = null;
        this.minRange = false;
        this.maxRange = false;
        this.autoApply = false;
        this.showDropdowns = false;
        this.autoUpdateInput = true;

        this.opens = 'right';
        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        this.drops = 'down';
        if (this.element.hasClass('dropup'))
            this.drops = 'up';

        this.buttonClasses = 'btn btn-sm';
        this.applyClass = 'btn-success';
        this.cancelClass = 'btn-default';

        this.locale = {
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            customRangeLabel: 'Custom Range'
        };

        this.callback = function() { };

        //some state information
        this.isShowing = false;

        //custom options from user
        if (typeof options !== 'object' || options === null)
            options = {};

        //allow setting options with data attributes
        //data-api options will be overwritten with custom javascript options
        options = $.extend(this.element.data(), options);

        //html template for the picker UI
        if (typeof options.template !== 'string')
            options.template = '<div class="rangepicker dropdown-menu">' +
                '<div class="calendar left">' +
                    '<div class="rangepicker_input">' +
                      '<input class="input-mini" type="text" name="rangepicker_start" value="" />' +
                      '<i class="fa fa-angle-right glyphicon glyphicon-chevron-right"></i>' +
                    '</div>' +
                '</div>' +
                '<div class="calendar right">' +
                    '<div class="rangepicker_input">' +
                      '<input class="input-mini" type="text" name="rangepicker_end" value="" />' +
                      '<i class="fa fa-angle-left glyphicon glyphicon-chevron-left"></i>' +
                    '</div>' +
                '</div>' +
                '<div class="ranges">' +
                    '<div class="range_inputs">' +
                        '<button class="cancelBtn" type="button" style="margin-right: 3px;"></button>' +
                        '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
                    '</div>' +
                '</div>' +
            '</div>';

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(options.template).appendTo(this.parentEl);

        //
        // handle all the possible options overriding defaults
        //

        if (typeof options.locale === 'object') {

            if (typeof options.locale.separator === 'string')
                this.locale.separator = options.locale.separator;

            if (typeof options.locale.applyLabel === 'string')
              this.locale.applyLabel = options.locale.applyLabel;

            if (typeof options.locale.cancelLabel === 'string')
              this.locale.cancelLabel = options.locale.cancelLabel;

        }

        if (typeof options.startRange === 'string')
            this.startRange = options.startRange;

        if (typeof options.endRange === 'string')
            this.endRange = options.endRange;

        if (typeof options.minRange === 'string')
            this.minRange = options.minRange;

        if (typeof options.maxRange === 'string')
            this.maxRange = options.maxRange;

        if (typeof options.startRange === 'object')
            this.startRange = options.startRange;

        if (typeof options.endRange === 'object')
            this.endRange = options.endRange;

        if (typeof options.minRange === 'object')
            this.minRange = options.minRange;

        if (typeof options.maxRange === 'object')
            this.maxRange = options.maxRange;

        // // sanity check for bad options
        // if (this.minRange && this.startRange.isBefore(this.minRange))
        //     this.startRange = this.minRange.clone();

        // // sanity check for bad options
        // if (this.maxRange && this.endRange.isAfter(this.maxRange))
        //     this.endRange = this.maxRange.clone();

        if (typeof options.applyClass === 'string')
            this.applyClass = options.applyClass;

        if (typeof options.cancelClass === 'string')
            this.cancelClass = options.cancelClass;

        // if (typeof options.dateLimit === 'object')
        //     this.dateLimit = options.dateLimit;

        if (typeof options.opens === 'string')
            this.opens = options.opens;

        if (typeof options.drops === 'string')
            this.drops = options.drops;

        // if (typeof options.showWeekNumbers === 'boolean')
        //     this.showWeekNumbers = options.showWeekNumbers;

        if (typeof options.buttonClasses === 'string')
            this.buttonClasses = options.buttonClasses;

        if (typeof options.buttonClasses === 'object')
            this.buttonClasses = options.buttonClasses.join(' ');

        if (typeof options.showDropdowns === 'boolean')
            this.showDropdowns = options.showDropdowns;

        // if (typeof options.singleRangePicker === 'boolean') {
        //     this.singleRangePicker = options.singleRangePicker;
        //     if (this.singleRangePicker)
        //         this.endRange = this.startRange.clone();
        // }

        if (typeof options.autoApply === 'boolean')
            this.autoApply = options.autoApply;

        if (typeof options.autoUpdateInput === 'boolean')
            this.autoUpdateInput = options.autoUpdateInput;

        if (typeof options.isInvalidRange === 'function')
            this.isInvalidRange = options.isInvalidRange;


        var start, end, range;

        //if no start/end dates set, check if an input element contains initial values
        if (typeof options.startRange === 'undefined' && typeof options.endRange === 'undefined') {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val(),
                    split = val.split(this.locale.separator);

                start = end = null;

                if (split.length == 2) {
                    start = split[0];
                    end = split[1];
                } 

                if (start !== null && end !== null) {
                    this.setStartRange(start);
                    this.setEndRange(end);
                }
            }
        }


        if (typeof cb === 'function') {
            this.callback = cb;
        }

        if (this.autoApply && typeof options.ranges !== 'object') {
            this.container.find('.ranges').hide();
        } else if (this.autoApply) {
            this.container.find('.applyBtn, .cancelBtn').addClass('hide');
        }


        this.container.addClass('opens' + this.opens);

        //swap the position of the predefined ranges if opens right
        if (typeof options.ranges !== 'undefined' && this.opens == 'right') {
            var ranges = this.container.find('.ranges');
            var html = ranges.clone();
            ranges.remove();
            this.container.find('.calendar.left').parent().prepend(html);
        }

        //apply CSS classes and labels to buttons
        this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
        if (this.applyClass.length)
            this.container.find('.applyBtn').addClass(this.applyClass);
        if (this.cancelClass.length)
            this.container.find('.cancelBtn').addClass(this.cancelClass);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //
        // event listeners
        //

        this.container.find('.calendar')
            .on('keyup.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsChanged, this))
            .on('change.rangepicker', '.rangepicker_input input', $.proxy(this.formInputsChanged, this));

        this.container.find('.ranges')
            .on('click.rangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.rangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this));

        if (this.element.is('input')) {
            this.element.on({
                'click.rangepicker': $.proxy(this.show, this),
                'focus.rangepicker': $.proxy(this.show, this),
                'keyup.rangepicker': $.proxy(this.elementChanged, this),
                'keydown.rangepicker': $.proxy(this.keydown, this)
            });
        } else {
            this.element.on('click.rangepicker', $.proxy(this.toggle, this));
        }

        //
        // if attached to a text input, set the initial value
        //

        if (this.element.is('input') && this.autoUpdateInput) {
            this.element.val(this.startRange + this.locale.separator + this.endRange);
            this.element.trigger('change');
        } else if (this.element.is('input') && this.autoUpdateInput) {
            this.element.val(this.startRange);
            this.element.trigger('change');
        }

    };

    RangePicker.prototype = {

        constructor: RangePicker,

        setStartRange: function(startRange) {
            //console.log("setstart picker %o", startRange);
            if (typeof startRange === 'string')
                this.startRange = startRange;

            if (typeof startRange === 'number')
                this.startRange = startRange.toString();

            // if (this.minRange && this.startRange.isBefore(this.minRange))
            //     this.startRange = this.minRange;

            // if (this.maxRange && this.startRange.isAfter(this.maxRange))
            //     this.startRange = this.maxRange;

            if (!this.isShowing) {
                this.updateElement();
            }

            if (this.endRange && this.startRange) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }


        },

        setEndRange: function(endRange) {
            //console.log("setsend picker %o", endRange);
            if (typeof endRange === 'string')
                this.endRange = endRange;

            if (typeof endRange === 'number')
                this.endRange = endRange.toString();

            // if (this.endRange.isBefore(this.startRange))
            //     this.endRange = this.startRange.clone();

            // if (this.maxRange && this.endRange.isAfter(this.maxRange))
            //     this.endRange = this.maxRange;


            if (!this.isShowing) {
                this.updateElement();
            }

            if (this.endRange && this.startRange) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        isInvalidRange: function() {
            return false;
        },

        updateView: function() {
            //console.log("upadteView");
            // if (this.endRange) {
            //     this.container.find('input[name="rangepicker_end"]').removeClass('active');
            //     this.container.find('input[name="rangepicker_start"]').addClass('active');
            // } else {
            //     this.container.find('input[name="rangepicker_end"]').addClass('active');
            //     this.container.find('input[name="rangepicker_start"]').removeClass('active');
            // }

            this.updateFormInputs();
        },


        updateFormInputs: function() {

            //ignore mouse movements while an above-calendar text input has focus
            if (this.container.find('input[name=rangepicker_start]').is(":focus") || this.container.find('input[name=rangepicker_end]').is(":focus"))
                return;

            this.container.find('input[name=rangepicker_start]').val(this.startRange);
            if (this.endRange)
                this.container.find('input[name=rangepicker_end]').val(this.endRange);

            if (this.endRange && this.startRange) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        move: function() {
            var parentOffset = { top: 0, left: 0 },
                containerTop;
            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }

            if (this.drops == 'up')
                containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
            else
                containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
            this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('dropup');

            if (this.opens == 'left') {
                this.container.css({
                    top: containerTop,
                    right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else if (this.opens == 'center') {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                            - this.container.outerWidth() / 2,
                    right: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function(e) {
            //console.log("show");
            this.container.addClass('show-calendar');
            if (this.isShowing) return;

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);

            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown.rangepicker', this._outsideClickProxy)
              // also support mobile devices
              .on('touchend.rangepicker', this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click.rangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin.rangepicker', this._outsideClickProxy);

            // Reposition the picker if the window is resized while it's open
            $(window).on('resize.rangepicker', $.proxy(function(e) { this.move(e); }, this));

            this.oldStartRange = this.startRange;
            this.oldEndRange = this.endRange;

            this.updateView();
            this.container.show();
            this.move();
            this.element.trigger('show.rangepicker', this);
            this.isShowing = true;
        },

        hide: function(e) {
            this.container.removeClass('show-calendar');
            if (!this.isShowing) return;

            //revert to last values 
            // if (!this.endRange && this.oldEndRange) {
            //     this.endRange = this.oldEndRange.clone();
            // }
            // if (!this.startRange && this.oldStartRange) {
            //     this.startRange = this.oldStartRange.clone();
            // }

            //if a new date range was selected, invoke the user callback function
            if (this.startRange !== this.oldStartRange || this.endRange !== this.oldEndRange) {
                this.callback(this.startRange, this.endRange);
            }

            //if picker is attached to a text input, update it
            this.updateElement();

            $(document).off('.rangepicker');
            $(window).off('.rangepicker');
            this.container.hide();
            this.element.trigger('hide.rangepicker', this);
            this.isShowing = false;
        },

        toggle: function(e) {
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        },

        outsideClick: function(e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type == "focusin" ||
                target.closest(this.element).length ||
                target.closest(this.container).length
                ) return;
            this.hide();
        },




        clickApply: function(e) {
            this.hide();
            this.element.trigger('apply.rangepicker', this);
        },

        clickCancel: function(e) {
            this.startRange = null;//this.oldStartRange;
            this.endRange = null;//this.oldEndRange;
            this.hide();
            this.container.find('input[name="rangepicker_start"]').val('');
            this.container.find('input[name="rangepicker_end"]').val('');
            this.element.trigger('cancel.rangepicker', this);
        },

  

        formInputsChanged: function(e) {
            //console.log("formInputsChanged");
            var isRight = $(e.target).closest('.calendar').hasClass('right');
            var start = this.container.find('input[name="rangepicker_start"]').val();
            var end = this.container.find('input[name="rangepicker_end"]').val();

            var startNumber = start ? start : "";//parseFloat(start);
            var endNumber = end ? end : "";//parseFloat(end);


            if (startNumber.length > 0 && endNumber.length > 0) {

                this.setStartRange(startNumber);
                this.setEndRange(endNumber);

                if (isRight) {
                    this.container.find('input[name="rangepicker_start"]').val(this.startRange);
                } else {
                    this.container.find('input[name="rangepicker_end"]').val(this.endRange);
                }
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }

        },

        elementChanged: function() {
            //console.log("element changed");
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var split = this.element.val().split(this.locale.separator),
                start = null,
                end = null;

            if (split.length === 2) {
                start = split[0];
                end = split[1];
            }

            // if (start === null || end === null) {
            //     start = this.element.val();
            //     end = start;
            // }

            //if (!start.isValid() || !end.isValid()) return;

            this.setStartRange(start);
            this.setEndRange(end);
            this.updateView();
        },

        keydown: function(e) {
            //hide on tab or enter
            if ((e.keyCode === 9) || (e.keyCode === 13)) {
                this.hide();
            }
        },

        updateElement: function() {
            
            if (this.element.is('input') && this.autoUpdateInput) {
                //console.log("update elemtnt");
                this.element.val(this.startRange + this.locale.separator + this.endRange);
                this.element.trigger('change');
            }
        },

        remove: function() {
            this.container.remove();
            this.element.off('.rangepicker');
            this.element.removeData();
        }

    };

    $.fn.rangepicker = function(options, callback) {
        this.each(function() {
            var el = $(this);
            if (el.data('rangepicker'))
                el.data('rangepicker').remove();
            el.data('rangepicker', new RangePicker(el, options, callback));
        });
        return this;
    };
    
    return RangePicker;

}));

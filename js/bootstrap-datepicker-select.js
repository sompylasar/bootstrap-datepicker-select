/* =========================================================
 * bootstrap-datepicker-select.js
 * http://github.com/sompylasar/bootstrap-datepicker-select
 * =========================================================
 * Copyright 2012 sompylasar
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

!function( $, undefined ) {
	var DPGlobal = $.fn.datepicker.DPGlobal;
	var dates = $.fn.datepicker.dates;

	// Copied from Bootstrap Datepicker by eternicode.
	function UTCDate() {
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday() {
		var today = new Date();
		return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
	}

	// Copied from Bootstrap Dropdown's private scope to be able to close other Dropdowns on the page.
	var Dropdown_toggle = '[data-toggle=dropdown]';

	function Dropdown_clearMenus() {
		$(Dropdown_toggle).each(function () {
			Dropdown_getParent($(this)).removeClass('open')
		})
	}

	function Dropdown_getParent($this) {
		var selector = $this.attr('data-target')
			, $parent

		if (!selector) {
			selector = $this.attr('href')
			selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
		}

		$parent = selector && $(selector)

		if (!$parent || !$parent.length) $parent = $this.parent()

		return $parent
	}
	
	var DatepickerSelect = function (element, options) {
		var _this = this;
		var nowDate = UTCToday();
		
		_this.element = $(element);
		_this.language = options.language||_this.element.data('date-language')||"en";
		_this.language = _this.language in dates ? _this.language : _this.language.split('-')[0]; //Check if "de-DE" style date is available, if not language should fallback to 2 letter code eg "de"
		_this.language = _this.language in dates ? _this.language : "en";
		//_this.isRTL = dates[_this.language].rtl||false;
		_this.format = DPGlobal.parseFormat(options.format||_this.element.data('date-format')||dates[_this.language].format||'mm/dd/yyyy');
		_this.monthNames = (options.monthNames === undefined ? _this.element.data('date-monthnames') : options.monthNames);
		_this.monthNames = ($.isArray(_this.monthNames)
			? _this.monthNames
			: (_this.monthNames === true || _this.monthNames === 'true'
				? dates[_this.language].months
				: undefined
			)
		);
		_this.measureWidth = !!options.measureWidth;
		
		_this.$input = _this.element.find('.datepicker-select-input');
		
		var selectedDate = options.date || _this.$input.val() || nowDate;
		selectedDate = DPGlobal.parseDate(selectedDate, _this.format, _this.language);
		
		var year = selectedDate.getUTCFullYear();
		var month = (selectedDate.getUTCMonth() + 1);
		var day = selectedDate.getUTCDate();
		
		_this.$year = _this.element.find('.datepicker-select-year');
		_this.$month = _this.element.find('.datepicker-select-month');
		_this.$day = _this.element.find('.datepicker-select-day');
		
		_this._populateSelect(_this.$year, 1900, nowDate.getFullYear(), !!options.yearsReverse);
		_this._populateSelect(_this.$month, 1, 12, false, _this.monthNames);
		
		_this.$year.val( year );
		_this.$month.val( month );
		
		_this._populateSelect(_this.$day, 1, DPGlobal.getDaysInMonth(year, month - 1));
		
		_this.$day.val( day );
		
		_this.$yearDropdown = _this._makeDropdown(_this.$year, true);
		_this.$monthDropdown = _this._makeDropdown(_this.$month, false, !!_this.monthNames);
		_this.$dayDropdown = _this._makeDropdown(_this.$day, true);
		
		_this._populateDropdown(_this.$year, _this.$yearDropdown);
		_this._populateDropdown(_this.$month, _this.$monthDropdown);
		_this._populateDropdown(_this.$day, _this.$dayDropdown);
		
		_this.$day
			.on('change.datepicker-select', function () {
				_this.$input.val(_this.getFormattedDate()).trigger('change.datepicker-select');
			});
		
		_this.$year.add(_this.$month)
			.on('change.datepicker-select', function () {
				var year = parseInt(_this.$year.val(), 10);
				var month = parseInt(_this.$month.val(), 10);
				var day = parseInt(_this.$day.val(), 10);
				_this._populateSelect(_this.$day,  1, DPGlobal.getDaysInMonth(year, month - 1));
				_this._populateDropdown(_this.$day, _this.$dayDropdown);
				_this.$day.val(day).trigger('change.datepicker-select');
			});
		
		_this.$input.val(_this.getFormattedDate()).trigger('change.datepicker-select');
	};
	DatepickerSelect.prototype = {
		constructor: DatepickerSelect,

		/**
		 * Returns the currently selected date.
		 * 
		 * @returns {Date|undefined} The selected date (local timezone), or undefined if something went wrong.
		 */
		getDate: function() {
			var d = this.getUTCDate();
			if (d) {
				return new Date(d.getTime() + (d.getTimezoneOffset()*60000));
			}
		},

		/**
		 * Returns the currently selected date in UTC.
		 * 
		 * @returns {Date|undefined} The selected date (UTC), or undefined if something went wrong.
		 */
		getUTCDate: function() {
			var _this = this;
			var year = parseInt(_this.$year.val(), 10);
			var month = parseInt(_this.$month.val(), 10);
			var day = parseInt(_this.$day.val(), 10);
			if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
				return UTCDate(year, month - 1, day, 0, 0, 0);
			}
		},

		setDate: function (date, format) {
			var _this = this;
			if (format === undefined)
				format = _this.format;
			date = DPGlobal.parseDate(date, format, _this.language);
			this.setUTCDate(new Date(date.getTime() - (date.getTimezoneOffset()*60000)));
		},

		/**
		 * Sets the currently selected date.
		 * Only year (getUTCFullYear), month (getUTCMonth) and date (getUTCDate) components are used.
		 * 
		 * @param {Date|String} date The date object or a string in the current or the specified format.
		 * @param {Object} [format] Parsed format returned from DPGlobal.parseFormat(format:String)
		 */
		setUTCDate: function (date, format) {
			var _this = this;
			if (format === undefined)
				format = _this.format;
			date = DPGlobal.parseDate(date, format, _this.language);
			var year = date.getUTCFullYear();
			var month = (date.getUTCMonth() + 1);
			var day = date.getUTCDate();
			if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
				_this.$year.val( year ).trigger('change.datepicker-select');
				_this.$month.val( month ).trigger('change.datepicker-select');
				_this.$day.val( day ).trigger('change.datepicker-select');
			}
		},

		/**
		 * Returns the formatted date string.
		 * 
		 * @param {Object} [format] Parsed format returned from DPGlobal.parseFormat(format:String)
		 * @param {String} The date formatted according to the current or the specified format.
		 */
		getFormattedDate: function (format) {
			var _this = this;
			if (format === undefined)
				format = _this.format;
			return DPGlobal.formatDate(_this.getUTCDate(), format, _this.language);
		},

		update: function () {
			var _this = this;
			if (_this.$input.length) {
				_this.setUTCDate(_this.$input.val());
			}
		},

		_makeDropdown: function ($select, isLong, isWide) {
			var _this = this;
			
			var $wrapper = $('<div class="btn-group input-append ' + $select[0].className + '">' +
					'<span class="dropdown-value uneditable-input' + (isWide ? ' dropdown-wide' : '') + '"></span>' +
					'<a class="add-on btn dropdown-toggle" href="javascript:;">' +
						'<span class="caret"></span>' +
					'</a>' +
					'<ul class="dropdown-menu' + (isLong ? ' dropdown-long' : '') + (isWide ? ' dropdown-wide' : '') + '"></ul>' +
					'<div class="dropdown-arrow"></div>' +
				'</div>');
			
			var $v = $wrapper.find('.dropdown-value');
			var $dd = $wrapper.find('.dropdown-menu');
			var $arrow = $wrapper.find('.dropdown-arrow');
			
			$select.hide().after($wrapper);
			$wrapper.prepend($select);
			
			$('html')
				.on('click.datepicker-select', function () {
					$wrapper.removeClass('open');
					$dd.before($arrow.removeClass('m-open'));
				});
			
			$wrapper.find('.dropdown-toggle')
				.on('focus.datepicker-select', function () {
					Dropdown_clearMenus();
					$('.open > .dropdown-menu').each(function () { $(this).parent().removeClass('open'); });
				})
				.on('click.datepicker-select', function (event) {
					if (!$wrapper.hasClass('open')) {
						Dropdown_clearMenus();
						$('.open > .dropdown-menu').each(function () { $(this).parent().removeClass('open'); });
						
						$dd.removeClass('keyboard-nav');
						
						$wrapper.addClass('open');
						var val = $select.val();
						$dd.find('a[data-value="' + val + '"]').focus();
						event.stopPropagation();
					}
				});
			
			$select
				.on('change.datepicker-select', function () {
					_this._populateValue($select, $dd, $v);
				});
			
			$dd
				.on('focus', 'a', function (event) {
					$dd.find('a.focus').removeClass('focus');
					$(this).addClass('focus');
				})
				.on('mousemove', 'a', function (event) {
					var $this = $(this);
					var thisHeight = $this.closest('li').outerHeight();
					var thisTop = $this.position().top;
					if (thisTop < -thisHeight/2) { return; }
					var ddHeight = $dd.height();
					if (thisTop + thisHeight/2 > ddHeight) { return; }
					
					// Do not handle the mouse while the user is using only the keyboard.
					if (!$dd.hasClass('keyboard-nav')) {
						$(this).addClass('focus').focus();
					}
					$dd.removeClass('keyboard-nav');
				})
				.on('click', 'a', function () {
					$select.val($(this).data('value')).trigger('change.datepicker-select');
				});
			
			_this._populateDropdown($select, $dd);
			_this._populateValue($select, $dd, $v);
			
			return $dd;
		},
		_populateValue: function ($select, $dd, $v) {
			var val = $select.val();
			var empty = '&nbsp;';
			if (val !== undefined) {
				var $option = $select.find('option[value="' + val + '"]');
				$v.html($option.html() || empty);
				$dd.find('a[data-value="' + val + '"]').focus();
			}
			else {
				$v.html(empty);
			}
		},
		_populateDropdown: function ($select, $dd) {
			var val = $select.val();
			var items = '';
			
			$select.find('option').each(function () {
				var $option = $(this);
				var v = $option.attr('value');
				items += '<li><a href="javascript:;" data-value="' + v + '">' + ($option.html() || '&nbsp;') + '</a></li>';
			});
			
			$dd.html(items);
			
			if (this.measureWidth) {
				// Measure the items to get the maximal width:
				var width = 0;
				$dd
					.addClass('measure-width')
					.find('> li > a')
						.each(function () {
							var w = $(this).width();
							if (w > width) {
								width = w;
							}
						})
						.end()
					.removeClass('measure-width');
				
				// Set the minimal width of the current value display field to the maximal width of the items:
				$dd.parent().find('.dropdown-value').css({ minWidth: width });
			}
			
			// Focus the currently active item:
			$dd.find('a[data-value="' + val + '"]').focus();
		},
		_populateSelect: function ($select, fromValue, toValue, reverse, displayNames) {
			var items = '';
			for (var
				vbegin = (reverse ? toValue : fromValue),
				vend = (reverse ? fromValue : toValue),
				vdelta = (reverse ? -1 : 1),
				v = vbegin,
				i = 0;
				(reverse ? v >= vend : v <= vend);
				v += vdelta,
				i += 1
			) {
				items += '<option value="' + v + '">' + (displayNames ? displayNames[i] : v) + '</option>';
			}
			$select.html(items);
		}
	};
	
	$.fn.datepickerSelect = function ( option ) {
		var args = Array.apply(null, arguments);
		args.shift();
		return this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker-select'),
				options = typeof option == 'object' && option;
			if (!data) {
				$this.data('datepicker-select', (data = new DatepickerSelect(this, $.extend({}, $.fn.datepickerSelect.defaults,options))));
			}
			if (typeof option == 'string' && typeof data[option] == 'function') {
				data[option].apply(data, args);
			}
		});
	};
	
	$.fn.datepickerSelect.defaults = {
		date: undefined,
		language: undefined,
		format: undefined,
		monthNames: undefined,
		yearsReverse: true,
		measureWidth: false
	};
	$.fn.datepickerSelect.Constructor = DatepickerSelect;

	$(document)
		.on('keydown.datepicker-select', function (e) {
			var $items;
			var $item;
			var count;
			var itemHeight;
			var itemsOnPage;
			var $toggle = $('.dropdown-toggle:focus');
			var $dd = $(':not(.disabled, :disabled).open > .dropdown-menu');
			var $select;

			if (!$dd.length && !$toggle.length) return;

			if (!/(38|40|37|39|36|35|33|34|9|13|27)/.test(e.keyCode)) return;

			if ($dd.length) {
				$items = $dd.find(' > li:not(.divider):visible a');
				$item = $items.filter(':focus, .focus').eq(0);
				
				if (e.keyCode == 9 || e.keyCode == 13) { // tab || enter
					$item.trigger('click');
					$dd.parent().find('.dropdown-toggle').focus();
					return;
				}
				if (e.keyCode == 27) { // escape
					$dd.parent().find('.dropdown-toggle').focus();
					return;
				}
				
				itemHeight = $items.eq(0).closest('li').outerHeight();
				itemsOnPage = Math.floor($dd.height() / itemHeight);
			}
			else {
				$select = $toggle.parent().find('select:not(.disabled, :disabled)');
				$items = $select.find('> option:not(.disabled, :disabled)');
				$item = $items.filter('[value="' + $select.val() + '"]');
				itemsOnPage = 10;
				
				if (e.keyCode == 9 || e.keyCode == 13) { // tab || enter
					return;
				}
				if (e.keyCode == 27) { // escape
					return;
				}
			}

			$dd.addClass('keyboard-nav');

			e.preventDefault();
			e.stopPropagation();

			count = $items.length;
			if (!count) return;

			var index = $items.index($item);

			if (e.keyCode == 38 && index > 0) index--;                                        // up
			if (e.keyCode == 40 && index < count - 1) index++;                                // down
			if (!$dd.length && e.keyCode == 37 && index > 0) index--;                                        // left
			if (!$dd.length && e.keyCode == 39 && index < count - 1) index++;                                // right
			if (e.keyCode == 36) index = 0;                                                   // home
			if (e.keyCode == 35) index = count - 1;                                           // end
			if (e.keyCode == 33) index = (index - itemsOnPage > 0 ? index - itemsOnPage : 0);           // page up
			if (e.keyCode == 34) index = (index + itemsOnPage < count - 1 ? index + itemsOnPage : count - 1);  // page down
			if (!~index) index = 0;

			$item = $items.eq(index);

			if ($dd.length) {
				$item.focus();
			}
			else {
				$select.val($item.attr('value')).trigger('change.datepicker-select');
			}
		});

	$(function () {
		$('[data-toggle="datepicker-select"]').datepickerSelect();
	});
}( window.jQuery );
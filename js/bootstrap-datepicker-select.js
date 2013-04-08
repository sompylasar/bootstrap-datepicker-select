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

(function( window, $, undefined ) {'use strict';
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

	function Dropdown_getParent($this) {
		var selector = $this.attr('data-target')
			, $parent;

		if (!selector) {
			selector = $this.attr('href');
			selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
		}

		$parent = selector && $(selector);

		if (!$parent || !$parent.length) { $parent = $this.parent(); }

		return $parent;
	}

	function Dropdown_clearMenus() {
		$(Dropdown_toggle).each(function () {
			Dropdown_getParent($(this)).removeClass('open');
		});
	}

	var DatepickerSelect = function (element, options) {
		var _this = this;
		var nowDate = UTCToday();
		var year, month, day;
		
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
		
		var selectedDate = options.date || _this.$input.val();
		if (selectedDate) {
			selectedDate = DPGlobal.parseDate(selectedDate, _this.format, _this.language);
		}
		else {
			selectedDate = null;
		}
		
		_this.$year = _this.element.find('.datepicker-select-year');
		_this.$month = _this.element.find('.datepicker-select-month');
		_this.$day = _this.element.find('.datepicker-select-day');
		
		_this._populateSelect(_this.$year, 1900, nowDate.getFullYear(), !!options.yearsReverse);
		_this._populateSelect(_this.$month, 1, 12, false, _this.monthNames);
		
		if (selectedDate) {
			year = selectedDate.getUTCFullYear();
			month = (selectedDate.getUTCMonth() + 1);
			day = selectedDate.getUTCDate();
			
			if (!isNaN(year)) {
				_this.$year.val(year);
			}
			if (!isNaN(month)) {
				_this.$month.val(month);
			}
		}
		
		_this._populateSelect(_this.$day, 1, (selectedDate ? DPGlobal.getDaysInMonth(year, month - 1) : 31));
		
		if (selectedDate && !isNaN(day)) {
			_this.$day.val(day);
		}
		
		_this.$yearDropdown = _this._makeDropdown(_this.$year, true);
		_this.$monthDropdown = _this._makeDropdown(_this.$month, false, !!_this.monthNames);
		_this.$dayDropdown = _this._makeDropdown(_this.$day, true);
		
		_this._populateDropdown(_this.$year, _this.$yearDropdown);
		_this._populateDropdown(_this.$month, _this.$monthDropdown);
		_this._populateDropdown(_this.$day, _this.$dayDropdown);
		
		_this.$day
			.on('change.datepicker-select', function () {
				_this.$input.val(_this.getFormattedDate() || '').trigger('change');
			});
		
		_this.$year.add(_this.$month)
			.on('change.datepicker-select', function () {
				var year = parseInt(_this.$year.val(), 10);
				var month = parseInt(_this.$month.val(), 10);
				var day = parseInt(_this.$day.val(), 10);
				if (!isNaN(year) && !isNaN(month)) {
					_this._populateSelect(_this.$day,  1, DPGlobal.getDaysInMonth(year, month - 1));
					_this._populateDropdown(_this.$day, _this.$dayDropdown);
				}
				else {
					_this._populateSelect(_this.$day,  1, 31);
					_this._populateDropdown(_this.$day, _this.$dayDropdown);
				}
				if (!isNaN(day)) {
					_this.$day.val(day).trigger('change');
				}
				else {
					_this.$day.val('').trigger('change');
				}
			});
		
		_this.$input.val(selectedDate ? _this.getFormattedDate() || '' : '').trigger('change');
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
			
			if (format === undefined) {
				format = _this.format;
			}
			
			if (date) {
				date = DPGlobal.parseDate(date, format, _this.language);
			}
			
			this.setUTCDate(date ? new Date(date.getTime() - (date.getTimezoneOffset()*60000)) : null);
		},

		/**
		 * Sets the currently selected date.
		 * Only year (getUTCFullYear), month (getUTCMonth) and date (getUTCDate) components are used.
		 * 
		 * @param {Date|String} date The date object or a string in the current or the specified format.
		 * @param {Object} [format] Parsed format returned from DPGlobal.parseFormat(format:String)
		 */
		setUTCDate: function (date, format) {
			var _this = this,
				year, month, day;
			
			if (format === undefined) {
				format = _this.format;
			}
			
			if (date) {
				date = DPGlobal.parseDate(date, format, _this.language);
				
				year = date.getUTCFullYear();
				month = (date.getUTCMonth() + 1);
				day = date.getUTCDate();
			}
			
			if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
				_this.$year.val(year).trigger('change');
				_this.$month.val(month).trigger('change');
				_this.$day.val(day).trigger('change');
			}
			else {
				_this.$year.val('').trigger('change');
				_this.$month.val('').trigger('change');
				_this.$day.val('').trigger('change');
			}
		},

		/**
		 * Returns the formatted date string.
		 * 
		 * @param {Object} [format] Parsed format returned from DPGlobal.parseFormat(format:String)
		 * @param {String} The date formatted according to the current or the specified format.
		 */
		getFormattedDate: function (format) {
			var _this = this,
				date;
			
			if (format === undefined) {
				format = _this.format;
			}
			
			date = _this.getUTCDate();
			
			return (date ? DPGlobal.formatDate(date, format, _this.language) : '');
		},

		update: function () {
			var _this = this;
			if (_this.$input.length) {
				_this.setUTCDate(_this.$input.val() || '');
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
			var $toggle = $wrapper.find('.dropdown-toggle');
			
			$select.hide().after($wrapper);
			$wrapper.prepend($select);
			
			$('html')
				.on('click.datepicker-select', function () {
					$wrapper.removeClass('open');
					$dd.before($arrow.removeClass('m-open'));
				});
			
			$v
				.on('focus.datepicker-select', function (event) {
					$toggle.focus();
					event.stopPropagation();
				})
				.on('click.datepicker-select', function (event) {
					$toggle.click();
					event.stopPropagation();
				});
				
			$toggle
				.on('focus.datepicker-select', function () {
					Dropdown_clearMenus();
					$('.open > .dropdown-menu').each(function () { $(this).parent().removeClass('open'); });
				})
				.on('click.datepicker-select', function (event) {
					$toggle.focus();
					
					if (!$wrapper.hasClass('open')) {
						Dropdown_clearMenus();
						$('.open > .dropdown-menu').each(function () { $(this).parent().removeClass('open'); });
						
						$dd.removeClass('keyboard-nav');
						
						$wrapper.addClass('open');
						
						var val = $select.val();
						if (val) {
							$dd.find('a[data-value="' + val + '"]').focus();
						}
						
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
					var val = $(this).data('value');
					if (val) {
						$select.val(val).trigger('change');
					}
				});
			
			_this._populateDropdown($select, $dd);
			_this._populateValue($select, $dd, $v);
			
			return $dd;
		},
		_populateValue: function ($select, $dd, $v) {
			var val = $select.val();
			var empty = '&nbsp;';
			if (val) {
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
				if (v) {
					items += '<li><a href="javascript:;" data-value="' + v + '">' + ($option.html() || '&nbsp;') + '</a></li>';
				}
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
			
			if (val) {
				// Focus the currently active item:
				$dd.find('a[data-value="' + val + '"]').focus();
			}
		},
		_populateSelect: function ($select, fromValue, toValue, reverse, displayNames) {
			var items = '',
				vbegin, vend, vdelta, v, i;
			
			items += '<option value=""></option>';
			for (
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
				options = typeof option === 'object' && option;
			if (!data) {
				$this.data('datepicker-select', (data = new DatepickerSelect(this, $.extend({}, $.fn.datepickerSelect.defaults,options))));
			}
			if (typeof option === 'string' && typeof data[option] === 'function') {
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
	
	var KEYCODES = {
		TAB: 9,
		ENTER: 13,
		ESCAPE: 27,
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39,
		HOME: 36,
		END: 35,
		PAGE_UP: 33,
		PAGE_DOWN: 34
	};
	
	var INVISIBLE_ITEMS_PER_PAGE = 10;
	
	$(window.document)
		.on('keydown.datepicker-select', function (e) {
			var $items;
			var $item;
			var count;
			var itemHeight;
			var itemsPerPage;
			var $toggle = $('.dropdown-toggle:focus');
			var $dd = $(':not(.disabled, :disabled).open > .dropdown-menu');
			var $select;
			var val;

			if (!$dd.length && !$toggle.length) { return; }

			if ([
				KEYCODES.UP, KEYCODES.DOWN, KEYCODES.LEFT, KEYCODES.RIGHT,
				KEYCODES.HOME, KEYCODES.END, KEYCODES.PAGE_DOWN, KEYCODES.PAGE_UP,
				KEYCODES.TAB, KEYCODES.ENTER, KEYCODES.ESCAPE
			].indexOf(e.keyCode) < 0) { return; }

			$items = $dd.find(' > li:not(.divider):visible a');
			if ($dd.is(':visible') && $items.length) {
				$item = $items.filter(':focus, .focus').eq(0);
				
				if (e.keyCode === KEYCODES.TAB || e.keyCode === KEYCODES.ENTER) {
					$item.trigger('click');
					$dd.parent().find('.dropdown-toggle').focus();
					return;
				}
				if (e.keyCode === KEYCODES.ESCAPE) {
					$dd.parent().find('.dropdown-toggle').focus();
					return;
				}
				
				itemHeight = $items.eq(0).closest('li').outerHeight();
				itemsPerPage = Math.floor($dd.height() / itemHeight);
			}
			else {
				$select = $toggle.parent().find('select:not(.disabled, :disabled)');
				$items = $select.find('> option:not(.disabled, :disabled):not([value=""])');
				
				val = $select.val();
				if (val) {
					$item = $items.filter('[value="' + val + '"]').eq(0);
				}
				
				itemsPerPage = INVISIBLE_ITEMS_PER_PAGE;
				
				if (e.keyCode === KEYCODES.TAB || e.keyCode === KEYCODES.ENTER) {
					return;
				}
				if (e.keyCode === KEYCODES.ESCAPE) {
					return;
				}
			}

			$dd.addClass('keyboard-nav');

			e.preventDefault();
			e.stopPropagation();

			count = $items.length;
			if (!count) { return; }

			var index = ($item ? $items.index($item) : -1);

			if (e.keyCode === KEYCODES.UP && index > 0) { index--; }
			if (e.keyCode === KEYCODES.DOWN && index < count - 1) { index++; }
			if (!$dd.length && e.keyCode === KEYCODES.LEFT && index > 0) { index--; }
			if (!$dd.length && e.keyCode === KEYCODES.RIGHT && index < count - 1) { index++; }
			if (e.keyCode === KEYCODES.HOME) { index = 0; }
			if (e.keyCode === KEYCODES.END) { index = count - 1; }
			if (e.keyCode === KEYCODES.PAGE_UP) { index = (index - itemsPerPage > 0 ? index - itemsPerPage : 0); }
			if (e.keyCode === KEYCODES.PAGE_DOWN) { index = (index + itemsPerPage < count - 1 ? index + itemsPerPage : count - 1); }
			if (!~index) { index = 0; }

			$item = $items.eq(index);

			if ($dd.length) {
				$item.focus();
			}
			else {
				$select.val($item.attr('value') || '').trigger('change');
			}
		});

	$(function () {
		$('[data-toggle="datepicker-select"]').datepickerSelect();
	});
}( window, window.jQuery ));
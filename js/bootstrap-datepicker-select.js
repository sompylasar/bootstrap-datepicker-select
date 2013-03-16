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

!function( $ ) {
	var DPGlobal = $.fn.datepicker.DPGlobal;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today"
		}
	};

	var DatepickerSelect = function (element, options) {
		var _this = this;
		var nowDate = new Date();
		
		_this.element = $(element);
		_this.language = options.language||_this.element.data('date-language')||"en";
		_this.language = _this.language in dates ? _this.language : _this.language.split('-')[0]; //Check if "de-DE" style date is available, if not language should fallback to 2 letter code eg "de"
		_this.language = _this.language in dates ? _this.language : "en";
		//_this.isRTL = dates[_this.language].rtl||false;
		_this.format = DPGlobal.parseFormat(options.format||_this.element.data('date-format')||dates[_this.language].format||'mm/dd/yyyy');
		
		_this.$input = _this.element.find('.datepicker-select-input');
		_this.$year = _this.element.find('.datepicker-select-year');
		_this.$month = _this.element.find('.datepicker-select-month');
		_this.$day = _this.element.find('.datepicker-select-day');
		
		_this._makeDropdown(_this.$year).addClass('dropdown-long');
		_this._makeDropdown(_this.$month);
		_this._makeDropdown(_this.$day).addClass('dropdown-long');
		
		_this._populateSelect(_this.$year, 1900, nowDate.getFullYear(), true);
		_this._populateSelect(_this.$month, 1, 12);
		_this._populateSelect(_this.$day, 1, 31);
		
		_this.$month.add(_this.$year)
			.change(function () {
				var year = parseInt(_this.$year.val(), 10);
				var month = parseInt(_this.$month.val(), 10);
				_this._populateSelect(_this.$day, 1, DPGlobal.getDaysInMonth(year, month - 1));
			})
			.change();
	};
	DatepickerSelect.prototype = {
		constructor: DatepickerSelect,
		
		getDate: function () {
			var date = new Date(this.$year.val() + '-' + this.$month.val() + '-' + this.$day.val() + 'T00:00:00');
			return date;
		},
		getFormattedDate: function(format) {
			if (format === undefined)
				format = this.format;
			return DPGlobal.formatDate(this.getDate(), format, this.language);
		},
		
		_makeDropdown: function ($select) {
			var _this = this;
			
			var $wrapper = $('<div class="btn-group input-append ' + $select[0].className + '">' +
					'<span class="dropdown-value uneditable-input input-mini"></span>' +
					'<a class="add-on btn dropdown-toggle" data-toggle="dropdown" href="javascript:;">' +
						'<span class="caret"></span>' +
					'</a>' +
					'<ul class="dropdown-menu"></ul>' +
				'</div>');
			
			var $v = $wrapper.find('.dropdown-value');
			var $dd = $wrapper.find('.dropdown-menu');
			
			$select.hide().before($wrapper);
			$wrapper.prepend($select);
			
			_this._populateDropdown($select, $dd);
			
			$wrapper.find('.dropdown-toggle')
				.click(function () {
					window.setTimeout(function () {
						if ($wrapper.hasClass('open')) {
							var $selected = $dd.find('.m-selected');
							if ($selected[0].scrollIntoView) {
								$selected[0].scrollIntoView();
								$dd.scrollTop( $dd.scrollTop() - parseInt($dd.css('paddingTop'), 10) );
							}
						}
					}, 0);
				});
			
			$select
				.change(function () {
					var val = $select.val();
					var $option = $select.find('option[value="' + val + '"]');
					$v.html($option.html() || '&nbsp;');
					$dd.find('.m-selected').removeClass('m-selected');
					$dd.find('a[data-value="' + val + '"]').closest('li').addClass('m-selected');
				});
			
			$dd
				.on('click', 'a', function () {
					$select.val($(this).data('value')).change();
				});
			
			$select.change();
			
			return $dd;
		},
		_populateDropdown: function ($select, $dd) {
			var $dd = $dd || $select.nextAll('.dropdown-menu:eq(0)');
			var val = $select.val();
			var options = '';
			$select.find('option').each(function () {
				var $option = $(this);
				var v = $option.attr('value');
				options += '<li' + (v === val ? ' class="m-selected"' : '') + '><a href="javascript:;" data-value="' + v + '">' + ($option.html() || '&nbsp;') + '</a></li>';
			});
			$dd.html(options);
		},
		_populateSelect: function ($select, fromValue, toValue, reverse) {
			var val = $select.val();
			var options = '';
			for (var v = (reverse ? toValue : fromValue),
				vc = (reverse ? fromValue : toValue),
				vx = (reverse ? -1 : 1);
				(reverse ? v >= vc : v <= vc);
				v += vx
			) {
				options += '<option value="' + v + '">' + v + '</option>';
			}
			$select.html(options).val(val).change();
			this._populateDropdown($select);
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
	};
	$.fn.datepickerSelect.Constructor = DatepickerSelect;

}( window.jQuery );
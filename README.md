# Bootstrap Datepicker Select

A @twitter bootstrap component for selecting a date from three dropdowns: year, month, day.

## How to use it

1. Include the dependencies (do not use github as CDN except for demo purposes)

[Twitter Bootstrap](http://twitter.github.com/bootstrap/) Base CSS (buttons, inputs) and [Dropdown CSS](https://github.com/twitter/bootstrap/blob/master/less/dropdowns.less) are required.
The component uses some parts of [Bootstrap Datepicker by eternicode](https://github.com/eternicode/bootstrap-datepicker) for counting the number of days in a month, date formatting and month names (see below).
[jQuery](http://jquery.com/) is a must, for sure.

    <link rel="stylesheet" href="http://twitter.github.com/bootstrap/assets/css/bootstrap.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
    <script src="https://raw.github.com/eternicode/bootstrap-datepicker/master/js/bootstrap-datepicker.js"></script>

3. Then just use the markup with `data-toggle` attribute:

    <div class="datepicker-select" data-toggle="datepicker-select">
      <select class="datepicker-select-day"></select>
      <select class="datepicker-select-month"></select>
      <select class="datepicker-select-year"></select>
    </div>

or activate the component manually:

    <script type="text/javascript">
      $(document).ready(function(){
        $('.datepicker-select').datepickerSelect();
      });
    </script>

You may pass the options object to the `datepickerSelect` call.

You may reorder the `<select>`s as required, just keep the `datepicker-select-*` classnames.

## Usage options

### Formatted date field

You may want a field that is automatically populated with the formatted date. The component may do this for you. Just use the following markup:

    <div class="datepicker-select" data-date-format="yyyy/mm/dd">
      <input type="hidden" class="datepicker-select-input" name="formatted-date" readonly />
      <select class="datepicker-select-day"></select>
      <select class="datepicker-select-month"></select>
      <select class="datepicker-select-year"></select>
    </div>

The `.datepicker-select-input` value will be updated with the currently selected date in the specified format.

The initial date will also be pre-filled with the field initial value.

See the [Bootstrap Datepicker by eternicode](https://github.com/eternicode/bootstrap-datepicker) docs and source code for the supported format options.

### Month names instead of numbers

Set the `data-date-monthnames` attribute to `"true"` to get the month names instead of numbers in the month field.

## Internationalization (i18n)

The component uses [`$.fn.datepicker.dates` object from Bootstrap Datepicker by eternicode](https://github.com/eternicode/bootstrap-datepicker/tree/master/js/locales) for the month names.
You may want to include some additional locales:

    <script src="https://raw.github.com/eternicode/bootstrap-datepicker/master/js/locales/bootstrap-datepicker.de.js"></script>
    <script src="https://raw.github.com/eternicode/bootstrap-datepicker/master/js/locales/bootstrap-datepicker.fr.js"></script>
    <script src="https://raw.github.com/eternicode/bootstrap-datepicker/master/js/locales/bootstrap-datepicker.ru.js"></script>

You may specify the language via `data-date-language` attribute or `language` option.

## About

Inspired by several projects:
* [jQuery.dateSelectBoxes by Nick Busey](http://nickabusey.com/jquery-date-select-boxes-plugin/)
* [Birthdaypicker by abecoffman](https://github.com/abecoffman/birthdaypicker)
* [Bootstrap Datepicker by eternicode](https://github.com/eternicode/bootstrap-datepicker)
* [Convert Select Boxes to a Fancy HTML Dropdown](http://blog.iamjamoy.com/convert-select-boxes-to-a-fancy-html-dropdown)

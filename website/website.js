$(document).ready(function() {

    $('#config-text').keyup(function() {
      eval($(this).val());
    });
    
    $('.configurator input, .configurator select').change(function() {
      updateConfig();
    });

    $('.demo i').click(function() {
      $(this).parent().find('input').click();
    });

    $('#startRange').rangepicker({
      singleRangePicker: true,
      startRange: moment().subtract(6, 'days')
    });

    $('#endRange').rangepicker({
      singleRangePicker: true,
      startRange: moment()
    });

    updateConfig();

    function updateConfig() {
      var options = {};

      if ($('#singleRangePicker').is(':checked'))
        options.singleRangePicker = true;
      
      if ($('#showDropdowns').is(':checked'))
        options.showDropdowns = true;

      if ($('#showWeekNumbers').is(':checked'))
        options.showWeekNumbers = true;

      if ($('#timePicker').is(':checked'))
        options.timePicker = true;
      
      if ($('#timePicker24Hour').is(':checked'))
        options.timePicker24Hour = true;

      if ($('#timePickerIncrement').val().length && $('#timePickerIncrement').val() != 1)
        options.timePickerIncrement = parseInt($('#timePickerIncrement').val(), 10);

      if ($('#timePickerSeconds').is(':checked'))
        options.timePickerSeconds = true;
      
      if ($('#autoApply').is(':checked'))
        options.autoApply = true;

      if ($('#dateLimit').is(':checked'))
        options.dateLimit = { days: 7 };

      if ($('#ranges').is(':checked')) {
        options.ranges = {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        };
      }

      if ($('#locale').is(':checked')) {
        options.locale = {
          format: 'MM/DD/YYYY',
          separator: ' - ',
          applyLabel: 'Apply',
          cancelLabel: 'Cancel',
          fromLabel: 'From',
          toLabel: 'To',
          customRangeLabel: 'Custom',
          daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
          monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          firstDay: 1
        };
      }

      if (!$('#linkedCalendars').is(':checked'))
        options.linkedCalendars = false;

      if (!$('#autoUpdateInput').is(':checked'))
        options.autoUpdateInput = false;

      if ($('#parentEl').val().length)
        options.parentEl = $('#parentEl').val();

      if ($('#startRange').val().length) 
        options.startRange = $('#startRange').val();

      if ($('#endRange').val().length)
        options.endRange = $('#endRange').val();
      
      if ($('#minRange').val().length)
        options.minRange = $('#minRange').val();

      if ($('#maxRange').val().length)
        options.maxRange = $('#maxRange').val();

      if ($('#opens').val().length && $('#opens').val() != 'right')
        options.opens = $('#opens').val();

      if ($('#drops').val().length && $('#drops').val() != 'down')
        options.drops = $('#drops').val();

      if ($('#buttonClasses').val().length && $('#buttonClasses').val() != 'btn btn-sm')
        options.buttonClasses = $('#buttonClasses').val();

      if ($('#applyClass').val().length && $('#applyClass').val() != 'btn-success')
        options.applyClass = $('#applyClass').val();

      if ($('#cancelClass').val().length && $('#cancelClass').val() != 'btn-default')
        options.cancelClass = $('#cancelClass').val();

      $('#config-text').val("$('#demo').rangepicker(" + JSON.stringify(options, null, '    ') + ", function(start, end, label) {\n  console.log(\"New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')\");\n});");

      $('#config-demo').rangepicker(options, function(start, end, label) { console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')'); });
      
    }

    if ($(window).width() > 980) {
        $('#sidebar').affix({
          offset: {
            top: 300,
            bottom: function () {
              return (this.bottom = $('.footer').outerHeight(true))
            }
          }
        });
    }
    $('body').scrollspy({ target: '#nav-spy', offset: 20 });
});
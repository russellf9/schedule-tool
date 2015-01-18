'use strict';

/**
 * Used to select a date value on a separate date service.
 * Will perform a function according to the result from the service.
 *
 */
tool.directive('dateInput', ['$filter', '$parse', 'dateFilter', 'DateSVC', function($filter, $parse, dateFilter, DateSVC) {

    var isSet = false;

    return {
        require: 'ngModel',
        template: '<input type="string"></input>',

        replace: true,

        link: function(scope, elm, attrs, ngModelCtrl) {
            ngModelCtrl.$formatters.unshift(function(modelValue) {
                if (modelValue) {
                    //  TODO - see if this initialisation can be done differently
                    DateSVC.setInitialValue(attrs.name, modelValue);
                    return dateFilter(new Date(modelValue), 'yyyy-MM-dd');
                }
            });

            ngModelCtrl.$parsers.unshift(function(viewValue) {
                if (viewValue) {
                    var date = new Date(viewValue),
                        obj = DateSVC.setValue(attrs.name, date.getTime()),
                        invoker;

                    if (obj.code === 'ERROR') {
                        invoker = $parse(attrs.ctrlFn);
                        invoker(scope)(obj);
                    } else {
                        invoker = $parse(attrs.updateFn);
                        invoker(scope)(obj);
                    }
                    return obj.date;
                }
            });
        }
    };
}]);


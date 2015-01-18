'use strict';

angular.module('ngOptionsDisabled', [])
    .directive('ngOptionsDisabled', ['$parse', function ($parse, $scope) {
        var disableOptions = function (scope, attr, element, data, fnDisableIfTrue) {
            // refresh the disabled options in the select element.
            var options = element.find('option');
            var pos = 0, index = 0;
            while (pos < options.length) {
                var elem = angular.element(options[pos]);
                if (elem.val() != "" && data) {
                    var locals = {};
                    locals[attr] = data[index];
                    elem.attr('disabled', fnDisableIfTrue(scope, locals));
                    index++;
                }
                pos++;
            }
        };
        return {
            priority: 0,
            $scope: {},
            require: 'ngModel',
            link: function (scope, el, attrs, ctrl) {
                // parse expression and build array of disabled options
                var expElements = attrs.ngOptionsDisabled.match(
                    /^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
                var attrToWatch = expElements[3];
                var fnDisableIfTrue = $parse(expElements[1]);
                scope.$watch(attrToWatch, function (newValue, oldValue) {
                    if (newValue)
                        disableOptions(scope, expElements[2], el,
                            newValue, fnDisableIfTrue);
                }, true);

                // handle model updates properly
                scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                    var disOptions = $parse(attrToWatch)(scope);
                    if (newValue)
                        disableOptions(scope, expElements[2], el,
                            disOptions, fnDisableIfTrue);
                });

                // hack to force the update of the options
                el.on('mousedown', function (event) {

                    console.log('mousedown')
                    //if (scope.hasCheck) {
                    //    return;
                    //}
                    //scope.hasCheck = true; // removed as behaviour was inconsistent in IE9 :-(
                    var disOptions = $parse(attrToWatch)(scope);

                    disableOptions(scope, expElements[2], el,
                        disOptions, fnDisableIfTrue);
                });
            }
        };
    }]);
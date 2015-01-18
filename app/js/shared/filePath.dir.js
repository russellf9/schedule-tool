'use strict';

/**
 * A directive to modify a supplied path to Windows or UNIX format
 */

tool.directive('filePath', ['$window', function($window) {

    return {

        controller: function($scope) {

            // Note: Modern macs returns navigator.platform == "MacIntel" but to give some "future proof" don't use
            // exact matching, hopefully they will change to something like MacARM or MacQuantum in future.

            var isMacLike = $window.navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false,
                isIOS = $window.navigator.platform.match(/(iPhone|iPod|iPad)/i) ? true : false,
                isLinux = $window.navigator.platform.match(/(linux)/i) ? true : false;


            $scope.isMac = function() {
                return isMacLike || isIOS;
            };

            $scope.isLinux = function() {
                return isLinux;
            };

            $scope.unixToDOS = /\//g;

            $scope.DOSToUnix = /\\/g;

            $scope.convertToDOS = function(value) {
                return value.replace($scope.unixToDOS, '\\');
            };

            $scope.convertToUNIX = function(value) {
                return value.replace($scope.DOSToUnix, '/');
            };


        },

        restrict: 'A',

        // the 'require' property says we need a ngModel attribute in the declaration.
        // this require makes a 4th argument available in the link function below
        require: 'ngModel',

        link: function(scope, element, attrs, ngModelController) {

            // format text going to user (model to view)
            // when model change, update our view (just update the div content)
            //ngModelController.$render = function() {
            //    console.log('new value: ',ngModelController.$viewValue);
            //};

            // (model to view)
            ngModelController.$formatters.unshift(function(value) {
                // Do stuff here, and return the formatted value.
                console.log('value: ', value);
                if (!value) {
                    return value;
                }

                if (scope.isMac()) {
                    return scope.convertToUNIX(value);

                } else {
                    return scope.convertToDOS(value);
                }

            });

            // format text (view to model)

            // NOTE  I can't return a single backslash `\'
            ngModelController.$parsers.unshift(function(viewValue) {
                return viewValue;
            });
        }
    };
}]);

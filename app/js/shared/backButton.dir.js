'use strict';

/**
 * A simple directive to use the browser history to implement `back` behaviour
 *
 * Usage:
 *  <a class="btn btn-default btn-sm" back-button role="button">Back</a>
 */

tool.directive('backButton', ['$window', function($window) {

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            // note `timeout` required due to IE9 bug
            element.bind('click', function() {
                setTimeout(function() {
                    $window.history.back();
                }, 10);
            });
        }
    };
}]);

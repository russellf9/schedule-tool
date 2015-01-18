'use strict';

/**
 * A very simple directive used to call a supplied function
 */

tool.directive('dateButton', [function() {
    return {
        restrict: 'EA',

        scope: {
            method: '&',
            type: '@'
        },

        controller: function($scope) {
            /**
             *
             * @param event
             * @param type a string of value `dt_start` or `dt_end`
             * @param date the new date
             */
            $scope.open = function(event, type, date) {
                $scope.method()(event, $scope.type);
            };
        },

        templateUrl: 'partials/date/date-button.html'
    };
}]);

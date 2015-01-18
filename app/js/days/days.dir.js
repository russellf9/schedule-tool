'use strict';

/**
 * A directive used to display the `day` information
 * Also, using a directive rather than a `ng-include` will help with optimization
 */

tool.directive('days', [function() {
    return {
        restrict: 'EA',

        scope: {
            slot: '=',
            config: '=',
            configIndex: '=',
            screen: '=',
            dates: '=',
            screens: '=',
            products: '=',
            artworks: '=',
            // this function is just passed downwards to the productDisplay directive
            getScreenProducts: '&',
            addScreenFn: '&',
            screenIsDisabled: '&'

        },

        controller: function($scope) {
            /**
             * Returns the date from the collection with the supplied index
             * @param index from the first day of the campaign to the last
             */
            $scope.getDate = function(index) {
                return $scope.dates[index];
            };
            /**
             * Creates a new `Screen`
             * @param day
             * @param slot
             * @param index
             * @param config
             */
            $scope.addScreen = function(day, slot, index, config) {
                $scope.addScreenFn()(day, slot, index, config);
            };
            /**
             * Evaluates if the screen in the specified screen should be disabled
             * ( Only the first screen will be enabled )
             * @param screenId
             * @param day
             * @param slot
             * @param index
             * @param config
             * @returns {*}
             */
            $scope.evaluateScreenIsDisabled = function(screenId, day, slot, index, config) {
                return $scope.screenIsDisabled()(screenId, day, slot, index, config);
            };

            $scope.isDisabled = function(screenId, day, slot, index, config) {
                return $scope.screenIsDisabled()(screenId, day, slot, index, config);
            };

        },

        link: {
            post: function(scope, element, attr, ngModelController) {
            }
        },

        templateUrl: 'partials/screens/days.html'
    };
}]);

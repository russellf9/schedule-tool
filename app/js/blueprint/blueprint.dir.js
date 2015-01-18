'use strict';

/**
 * A directive used to display the `blueprint`
 * Also using a directive rather than a `ng-include` will help with optimization
 */

tool.directive('blueprint', [function() {
    return {
        restrict: 'EA',
        templateUrl: 'partials/screens/blueprint.html'
    };
}]);


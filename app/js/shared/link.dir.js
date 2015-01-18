'use strict';

/**
 * A directive used to handle links for both assets and artworks
 * Allows the firebase object to resolve before attaching the links
 */

tool.directive('assetLink', [function() {
    return {
        restrict: 'EA',
        replace: 'true',
        scope: {
            type: '@',
            index: '=',
            records: '=',
            item: '='
        },
        link: {
            post: function(scope, element, attr, ngModelController) {
                scope.records.$loaded(function(list) {
                    scope.record = scope.records.$getRecord(scope.item);
                });
            }
        },
        templateUrl: 'partials/shared/link.html'
    };
}]);
